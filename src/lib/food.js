// Owner: Person A — food lookup + healthier swaps via Open Food Facts.
//
// Food shape used across the app:
// {
//   barcode, name, brand, image, servingGrams, hasNutrition,
//   per100g: { kcal, protein, carbs, fat, sugar, satFat, salt },
//   nutriscore: "a".."e" | null, nova: 1..4 | null,
//   allergens: ["milk", ...], traces: [...], analysis: ["non-vegan", "palm-oil", ...],
//   labels: ["halal", ...], categories: ["en:colas", ...], ingredientsText
// }

const PRODUCT_API = "https://world.openfoodfacts.org/api/v2/product/";
const SEARCH_V2 = "https://world.openfoodfacts.org/api/v2/search";
// Newer search service. It has no CORS headers, so it's reached through a
// same-origin proxy (vite.config.js in dev, vercel.json / public/_redirects when deployed).
const SEARCH_PROXY = "/off-search";

const FIELDS = [
  "code",
  "product_name",
  "brands",
  "image_front_small_url",
  "serving_quantity",
  "nutriments",
  "nutriscore_grade",
  "nova_group",
  "allergens_tags",
  "traces_tags",
  "ingredients_analysis_tags",
  "labels_tags",
  "categories_tags",
  "ingredients_text",
].join(",");

export const GRADE_RANK = { a: 1, b: 2, c: 3, d: 4, e: 5 };

const cache = new Map();

export function normalizeBarcode(raw) {
  return String(raw).replace(/\D/g, "");
}

function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

// "en:milk" -> "milk"
const stripLang = (tags) => (tags || []).map((t) => String(t).replace(/^[a-z]{2}:/, ""));

function firstBrand(brands) {
  if (Array.isArray(brands)) return (brands[0] || "").trim();
  return (brands || "").split(",")[0].trim();
}

export function toFood(p, barcode) {
  const n = p.nutriments || {};
  const kcal = n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] / 4.184 : 0);
  return {
    barcode: barcode || String(p.code || ""),
    name: p.product_name || "Unknown product",
    brand: firstBrand(p.brands),
    image: p.image_front_small_url || "",
    servingGrams: num(p.serving_quantity) || 100,
    hasNutrition: n["energy-kcal_100g"] != null || n["energy_100g"] != null,
    per100g: {
      kcal: Math.round(num(kcal)),
      protein: num(n.proteins_100g),
      carbs: num(n.carbohydrates_100g),
      fat: num(n.fat_100g),
      sugar: num(n.sugars_100g),
      satFat: num(n["saturated-fat_100g"]),
      salt: num(n.salt_100g),
    },
    nutriscore: GRADE_RANK[p.nutriscore_grade] ? p.nutriscore_grade : null,
    nova: [1, 2, 3, 4].includes(Number(p.nova_group)) ? Number(p.nova_group) : null,
    allergens: stripLang(p.allergens_tags),
    traces: stripLang(p.traces_tags),
    analysis: stripLang(p.ingredients_analysis_tags),
    labels: stripLang(p.labels_tags),
    categories: (p.categories_tags || []).filter((t) => String(t).startsWith("en:")),
    ingredientsText: (p.ingredients_text || "").toLowerCase(),
  };
}

async function fetchProduct(barcode) {
  const res = await fetch(`${PRODUCT_API}${barcode}.json?fields=${FIELDS}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.status === 1 && data.product ? toFood(data.product, barcode) : null;
}

/** Returns a Food, or null if the barcode isn't in Open Food Facts. Throws on network errors. */
export async function lookupBarcode(raw) {
  const barcode = normalizeBarcode(raw);
  if (!barcode) return null;
  if (cache.has(barcode)) return cache.get(barcode);

  let food = await fetchProduct(barcode);
  // UPC-A (12 digits) is often stored as EAN-13 with a leading zero.
  if (!food && barcode.length === 12) food = await fetchProduct("0" + barcode);

  cache.set(barcode, food);
  return food;
}

/** Nutrition for a given number of grams of a food. */
export function nutritionFor(food, grams) {
  const f = grams / 100;
  const p = food.per100g;
  const r1 = (x) => +(x * f).toFixed(1);
  return {
    kcal: Math.round(p.kcal * f),
    protein: r1(p.protein),
    carbs: r1(p.carbs),
    fat: r1(p.fat),
    sugar: r1(p.sugar),
  };
}

// ---------- Healthier swaps ----------

async function searchCategory(category, betterGrades) {
  // 1) New search service via proxy (fast, reliable)
  try {
    const q = `categories_tags:"${category}" AND nutriscore_grade:(${betterGrades.join(" OR ")})`;
    const url = `${SEARCH_PROXY}?q=${encodeURIComponent(q)}&page_size=30&sort_by=-unique_scans_n&fields=${FIELDS}`;
    const res = await fetch(url);
    if (res.ok && (res.headers.get("content-type") || "").includes("json")) {
      const data = await res.json();
      if (Array.isArray(data.hits)) return data.hits;
    }
  } catch {
    // fall through
  }
  // 2) Fallback: classic search API (CORS-enabled but sometimes returns 503)
  const url = `${SEARCH_V2}?categories_tags=${encodeURIComponent(category)}&sort_by=unique_scans_n&page_size=50&fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`search ${res.status}`);
  const data = await res.json();
  return data.products || [];
}

/**
 * Finds products in the same category with a better Nutri-Score.
 * `isOk(food)` lets the caller drop swaps that clash with the user's allergies/diet.
 */
export async function findSwaps(food, isOk = () => true, limit = 3) {
  const myRank = GRADE_RANK[food.nutriscore] ?? 6;
  if (myRank <= 1) return []; // already Nutri-Score A
  const betterGrades = Object.keys(GRADE_RANK).filter((g) => GRADE_RANK[g] < myRank);

  // Most specific category first, then broaden.
  const categories = [...food.categories].reverse().slice(0, 3);
  for (const category of categories) {
    let products;
    try {
      products = await searchCategory(category, betterGrades);
    } catch {
      continue;
    }
    const seen = new Set();
    const swaps = products
      .map((p) => toFood(p))
      .filter((f) => {
        const key = f.name.toLowerCase();
        if (seen.has(key) || f.barcode === food.barcode || f.name === "Unknown product") return false;
        seen.add(key);
        return (GRADE_RANK[f.nutriscore] ?? 6) < myRank && isOk(f);
      })
      .sort((x, y) => GRADE_RANK[x.nutriscore] - GRADE_RANK[y.nutriscore]);
    if (swaps.length) return swaps.slice(0, limit);
  }
  return [];
}
