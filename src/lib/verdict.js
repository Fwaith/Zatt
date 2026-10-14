// Owner: Person A — the "Should I eat this?" engine.
//
// getVerdict(food, profile, { today, grams, expiry }) -> { level, reasons }
//   level:   "go" | "caution" | "stop"
//   reasons: [{ level: "stop" | "caution" | "go" | "info", text }]
// The worst reason decides the verdict.

import { nutritionFor } from "./food.js";
import { ALLERGENS } from "./profile.js";

export const LEVELS = {
  go: { icon: "✅", label: "Go for it" },
  caution: { icon: "⚠️", label: "In moderation" },
  stop: { icon: "⛔", label: "Don't eat" },
};

const RANK = { info: 0, go: 0, caution: 1, stop: 2 };
const SORT = { stop: 0, caution: 1, go: 2, info: 3 };

const reason = (level, text) => ({ level, text });
const allergenName = (id) => (ALLERGENS.find((a) => a.id === id)?.label ?? id).toLowerCase();

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

// ---------- individual checks ----------

export function expiryReasons(expiry) {
  const days = daysUntil(expiry);
  if (days === null) return [];
  if (days < 0) return [reason("stop", `Expired ${-days} day${days === -1 ? "" : "s"} ago`)];
  if (days === 0) return [reason("go", "Expires today. Eat it now!")];
  if (days <= 2) return [reason("go", `Eat soon. Expires in ${days} day${days === 1 ? "" : "s"}`)];
  return [reason("info", `Fresh: ${days} days until expiry`)];
}

export function allergenReasons(food, allergens = []) {
  if (!allergens.length) return [];
  const out = [];
  for (const a of allergens) {
    if (food.allergens.includes(a)) out.push(reason("stop", `Contains ${allergenName(a)} (your allergy)`));
    else if (food.traces.includes(a)) out.push(reason("stop", `May contain traces of ${allergenName(a)}`));
  }
  if (!out.length && !food.allergens.length && !food.ingredientsText) {
    out.push(reason("caution", "No allergen info. Check the label"));
  }
  return out;
}

const tagged = (food, tag) => food.analysis.includes(tag);
const NON_HALAL = /\b(pork|lard|bacon|ham|gelatin|gelatine|wine|rum|beer|alcohol)\b/;

const DIET_RULES = {
  vegan: (f) =>
    tagged(f, "non-vegan") ? ["stop", "Not vegan"]
    : tagged(f, "vegan") ? null
    : ["caution", "Vegan status unclear. Check ingredients"],
  vegetarian: (f) =>
    tagged(f, "non-vegetarian") ? ["stop", "Not vegetarian"]
    : tagged(f, "vegetarian") ? null
    : ["caution", "Vegetarian status unclear. Check ingredients"],
  halal: (f) =>
    f.labels.includes("halal") ? null
    : NON_HALAL.test(f.ingredientsText) ? ["stop", "Contains non-halal ingredients"]
    : tagged(f, "non-vegetarian") ? ["caution", "Contains meat without halal certification"]
    : null,
  "gluten-free": (f) =>
    f.allergens.includes("gluten") ? ["stop", "Contains gluten"]
    : f.traces.includes("gluten") ? ["caution", "May contain gluten traces"]
    : null,
  "dairy-free": (f) => (f.allergens.includes("milk") ? ["stop", "Contains dairy"] : null),
  "low-sugar": (f) =>
    f.per100g.sugar > 22.5 ? ["caution", `High in sugar: ${f.per100g.sugar} g per 100 g`] : null,
  keto: (f) =>
    f.per100g.carbs > 10 ? ["caution", `Too many carbs for keto: ${f.per100g.carbs} g per 100 g`] : null,
  "palm-oil-free": (f) =>
    tagged(f, "palm-oil") ? ["caution", "Contains palm oil"]
    : tagged(f, "may-contain-palm-oil") ? ["caution", "May contain palm oil"]
    : null,
};

export function dietReasons(food, diets = []) {
  return diets
    .map((d) => DIET_RULES[d]?.(food))
    .filter(Boolean)
    .map(([level, text]) => reason(level, text));
}

export function healthReasons(food) {
  const out = [];
  const g = food.nutriscore;
  if (!g) out.push(reason("info", "No Nutri-Score available"));
  else if (g === "a" || g === "b") out.push(reason("go", `Nutri-Score ${g.toUpperCase()}: good nutritional quality`));
  else if (g === "c") out.push(reason("info", `Nutri-Score C: average nutritional quality`));
  else out.push(reason("caution", `Nutri-Score ${g.toUpperCase()}: poor nutritional quality`));

  // Ultra-processed only counts against products that aren't otherwise healthy.
  if (food.nova === 4) {
    const healthy = g === "a" || g === "b";
    out.push(reason(healthy ? "info" : "caution", "Ultra-processed food (NOVA 4)"));
  }
  else if (food.nova === 1) out.push(reason("go", "Unprocessed or minimally processed"));
  return out;
}

export function dayReasons(food, profile, today, grams) {
  if (!food.hasNutrition) return [reason("info", "No nutrition data. Can't check it against your day")];
  const n = nutritionFor(food, grams);
  const kcalLeft = profile.goal - today.kcal;
  const sugarLeft = profile.sugarLimit - today.sugar;
  const out = [];
  if (n.kcal > kcalLeft) {
    out.push(reason("caution", `${n.kcal} kcal puts you over today's goal (${Math.max(kcalLeft, 0)} left)`));
  } else {
    out.push(reason("go", `${n.kcal} kcal fits your day (${kcalLeft} left)`));
  }
  if (n.sugar >= 1 && n.sugar > sugarLeft) {
    out.push(reason("caution", `${n.sugar} g sugar goes over your ${profile.sugarLimit} g daily limit`));
  }
  return out;
}

// ---------- the verdict ----------

export function getVerdict(food, profile, { today, grams, expiry } = {}) {
  const reasons = [
    ...expiryReasons(expiry),
    ...allergenReasons(food, profile.allergens),
    ...dietReasons(food, profile.diets),
    ...healthReasons(food),
    ...(today ? dayReasons(food, profile, today, grams ?? food.servingGrams) : []),
  ].sort((a, b) => SORT[a.level] - SORT[b.level]);

  const worst = Math.max(0, ...reasons.map((r) => RANK[r.level]));
  const level = worst === 2 ? "stop" : worst === 1 ? "caution" : "go";
  return { level, reasons };
}

/** True when nothing about the food clashes with the user's allergies or diet. */
export function isSafeFor(food, profile) {
  return ![...allergenReasons(food, profile.allergens), ...dietReasons(food, profile.diets)].some(
    (r) => r.level === "stop"
  );
}
