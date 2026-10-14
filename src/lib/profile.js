// Owner: Person B — the user's allergies, diets and goals.
import { read, write } from "./storage.js";

const KEY = "tracker.profile";

// ids match Open Food Facts allergen tags (without the "en:" prefix)
export const ALLERGENS = [
  { id: "peanuts", label: "Peanuts", emoji: "🥜" },
  { id: "nuts", label: "Tree nuts", emoji: "🌰" },
  { id: "milk", label: "Milk", emoji: "🥛" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "gluten", label: "Gluten", emoji: "🌾" },
  { id: "soybeans", label: "Soy", emoji: "🫘" },
  { id: "fish", label: "Fish", emoji: "🐟" },
  { id: "crustaceans", label: "Shellfish", emoji: "🦐" },
  { id: "sesame-seeds", label: "Sesame", emoji: "🌱" },
  { id: "mustard", label: "Mustard", emoji: "🟡" },
  { id: "celery", label: "Celery", emoji: "🥬" },
];

export const DIETS = [
  { id: "vegan", label: "Vegan", emoji: "🌿" },
  { id: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { id: "halal", label: "Halal", emoji: "☪️" },
  { id: "gluten-free", label: "Gluten-free", emoji: "🚫🌾" },
  { id: "dairy-free", label: "Dairy-free", emoji: "🚫🥛" },
  { id: "low-sugar", label: "Low sugar", emoji: "🍬" },
  { id: "keto", label: "Keto", emoji: "🥑" },
  { id: "palm-oil-free", label: "No palm oil", emoji: "🌴" },
];

export const DEFAULT_PROFILE = {
  allergens: [],
  diets: [],
  goal: 2000, // kcal per day
  sugarLimit: 30, // g per day (WHO guideline for added sugar)
};

export function loadProfile() {
  return { ...DEFAULT_PROFILE, ...read(KEY, {}) };
}

export const saveProfile = (profile) => write(KEY, profile);

export function toggle(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
