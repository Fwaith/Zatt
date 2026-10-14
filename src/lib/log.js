// Owner: Person B — food log + daily/weekly stats, stored in localStorage.
//
// Entry shape:
// { id, date: "YYYY-MM-DD", time, barcode, name, image, grams,
//   kcal, protein, carbs, fat, sugar, nutriscore, level }

import { GRADE_RANK, nutritionFor } from "./food.js";
import { read, write } from "./storage.js";

const ENTRIES_KEY = "tracker.entries";

export function todayKey(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const loadEntries = () => read(ENTRIES_KEY, []);
export const saveEntries = (entries) => write(ENTRIES_KEY, entries);

export function makeEntry(food, grams, level) {
  return {
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    date: todayKey(),
    time: new Date().toISOString(),
    barcode: food.barcode,
    name: food.name,
    image: food.image,
    emoji: food.emoji,
    grams,
    nutriscore: food.nutriscore,
    level,
    ...nutritionFor(food, grams),
  };
}

export function entriesFor(entries, date = todayKey()) {
  return entries.filter((e) => e.date === date);
}

export function totals(entries) {
  const t = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      sugar: acc.sugar + (e.sugar || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  );
  return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Math.round(v)]));
}

/** Simple macro targets from a calorie goal (25% protein / 50% carbs / 25% fat). */
export function macroTargets(goal) {
  return {
    protein: Math.round((goal * 0.25) / 4),
    carbs: Math.round((goal * 0.5) / 4),
    fat: Math.round((goal * 0.25) / 9),
  };
}

/** Last `days` days (oldest first) with total kcal and sugar per day. */
export function dailyTotals(entries, days = 7) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    const t = totals(entriesFor(entries, key));
    out.push({
      date: key,
      label: i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" }),
      kcal: t.kcal,
      sugar: t.sugar,
    });
  }
  return out;
}

/** Average Nutri-Score of the logged entries, as a letter (or null). */
export function averageGrade(entries) {
  const ranks = entries.map((e) => GRADE_RANK[e.nutriscore]).filter(Boolean);
  if (!ranks.length) return null;
  const avg = Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length);
  return Object.keys(GRADE_RANK).find((g) => GRADE_RANK[g] === avg);
}

export function entriesSince(entries, days) {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  const from = todayKey(d);
  return entries.filter((e) => e.date >= from);
}
