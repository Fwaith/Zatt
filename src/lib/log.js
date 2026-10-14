// Owner: Person B — food log + goals, stored in localStorage.
//
// Entry shape:
// { id, date: "YYYY-MM-DD", time, barcode, name, image, grams, kcal, protein, carbs, fat }

import { nutritionFor } from "./food.js";

const ENTRIES_KEY = "tracker.entries";
const GOAL_KEY = "tracker.goal";
export const DEFAULT_GOAL = 2000;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked (private mode etc.) — app still works for this session.
  }
}

export function todayKey(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const loadEntries = () => read(ENTRIES_KEY, []);
export const saveEntries = (entries) => write(ENTRIES_KEY, entries);
export const loadGoal = () => read(GOAL_KEY, DEFAULT_GOAL);
export const saveGoal = (goal) => write(GOAL_KEY, goal);

export function makeEntry(food, grams) {
  return {
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    date: todayKey(),
    time: new Date().toISOString(),
    barcode: food.barcode,
    name: food.name,
    image: food.image,
    grams,
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
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    kcal: Math.round(t.kcal),
    protein: Math.round(t.protein),
    carbs: Math.round(t.carbs),
    fat: Math.round(t.fat),
  };
}

/** Simple macro targets from a calorie goal (25% protein / 50% carbs / 25% fat). */
export function macroTargets(goal) {
  return {
    protein: Math.round((goal * 0.25) / 4),
    carbs: Math.round((goal * 0.5) / 4),
    fat: Math.round((goal * 0.25) / 9),
  };
}
