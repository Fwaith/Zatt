// Owner: Person B — scan history (every product scanned, with verdict + expiry).
//
// HistoryItem: { barcode, food, level, scannedAt, expiry: "YYYY-MM-DD" | null, logged }

import { read, write } from "./storage.js";

const KEY = "tracker.history";
const MAX_ITEMS = 100;

export const loadHistory = () => read(KEY, []);
export const saveHistory = (history) => write(KEY, history);

/** Moves the product to the top of the history, keeping any expiry date set earlier. */
export function recordScan(history, food) {
  const prev = history.find((h) => h.barcode === food.barcode);
  const item = {
    barcode: food.barcode,
    food,
    level: prev?.level ?? null,
    scannedAt: new Date().toISOString(),
    expiry: prev?.expiry ?? null,
    logged: false,
  };
  return [item, ...history.filter((h) => h.barcode !== food.barcode)].slice(0, MAX_ITEMS);
}

export function updateItem(history, barcode, patch) {
  return history.map((h) => (h.barcode === barcode ? { ...h, ...patch } : h));
}

export function scannedWithin(history, days) {
  const since = Date.now() - days * 86400000;
  return history.filter((h) => new Date(h.scannedAt).getTime() >= since);
}

export function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
