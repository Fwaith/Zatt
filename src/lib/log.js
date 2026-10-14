// Owner: Person B — food log + daily/weekly stats, stored in localStorage.
//
// Entry shape:
// { id, date: "YYYY-MM-DD", time, meal, barcode, name, image, emoji, grams,
//   kcal, protein, carbs, fat, sugar, nutriscore, level }

import { GRADE_RANK, nutritionFor } from "./food.js";
import { read, write } from "./storage.js";

const ENTRIES_KEY = "tracker.entries";

export function todayKey(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const MEALS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snacks", label: "Snacks" },
];

/** Best-guess meal for a time of day. */
export function mealForTime(d = new Date()) {
  const h = d.getHours();
  if (h >= 4 && h < 11) return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 17 && h < 22) return "dinner";
  return "snacks";
}

/** Older entries were saved without a meal, so fall back to the time they were logged. */
export const mealOf = (entry) => entry.meal || mealForTime(new Date(entry.time));

export const loadEntries = () => read(ENTRIES_KEY, []);
export const saveEntries = (entries) => write(ENTRIES_KEY, entries);

export function makeEntry(food, grams, level, meal = mealForTime()) {
  return {
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    date: todayKey(),
    time: new Date().toISOString(),
    meal,
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

/** Macro targets: the user's protein goal, with the remaining calories split 60% carbs / 40% fat. */
export function macroTargets(goal, proteinGoal) {
  const rest = Math.max(goal - proteinGoal * 4, 0);
  return {
    protein: proteinGoal,
    carbs: Math.round((rest * 0.6) / 4),
    fat: Math.round((rest * 0.4) / 9),
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
