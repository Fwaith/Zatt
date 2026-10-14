// Owner: Person A — food lookup via Open Food Facts.
//
// Food shape used across the app:
// { barcode, name, brand, image, servingGrams, per100g: { kcal, protein, carbs, fat } }

const API = "https://world.openfoodfacts.org/api/v2/product/";
const FIELDS = [
  "code",
  "product_name",
  "brands",
  "image_front_small_url",
  "serving_quantity",
  "nutriments",
].join(",");

const cache = new Map();

export function normalizeBarcode(raw) {
  return String(raw).replace(/\D/g, "");
}

function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function toFood(product, barcode) {
  const n = product.nutriments || {};
  const kcal = n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] / 4.184 : 0);
  return {
    barcode,
    name: product.product_name || "Unknown product",
    brand: (product.brands || "").split(",")[0].trim(),
    image: product.image_front_small_url || "",
    servingGrams: num(product.serving_quantity) || 100,
    per100g: {
      kcal: Math.round(num(kcal)),
      protein: num(n.proteins_100g),
      carbs: num(n.carbohydrates_100g),
      fat: num(n.fat_100g),
    },
  };
}

async function fetchProduct(barcode) {
  const res = await fetch(`${API}${barcode}.json?fields=${FIELDS}`);
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
  return {
    kcal: Math.round(p.kcal * f),
    protein: +(p.protein * f).toFixed(1),
    carbs: +(p.carbs * f).toFixed(1),
    fat: +(p.fat * f).toFixed(1),
  };
}
