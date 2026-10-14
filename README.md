# Track-er

Scan a food barcode, see its nutrition, and log it against a daily calorie goal.
Data comes from [Open Food Facts](https://world.openfoodfacts.org). The log is saved in the browser (`localStorage`), so there's no backend.

## Run

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. The camera only works on **HTTPS or localhost**. To test on a phone, deploy (e.g. Vercel/Netlify) or use the "Try a sample" buttons / type a barcode.

## Who owns what

| Person | Files |
|---|---|
| **A: Scanner + API** | `src/lib/food.js`, `src/components/Scanner.jsx`, `src/components/ScanView.jsx` |
| **B: Log + Dashboard** | `src/lib/log.js`, `src/components/Dashboard.jsx` |
| **C: Shell + UI** | `src/App.jsx`, `src/components/ProductCard.jsx`, `src/styles.css` |

## Shared data shapes (don't change without telling the team)

```js
// Food  (from lib/food.js)
{ barcode, name, brand, image, servingGrams, per100g: { kcal, protein, carbs, fat } }

// Entry (from lib/log.js)
{ id, date: "YYYY-MM-DD", time, barcode, name, image, grams, kcal, protein, carbs, fat }
```

## Feature ideas

- Meal categories (breakfast/lunch/dinner/snack)
- Manual food entry when a barcode isn't found
- History view / weekly chart
- Recently scanned list for quick re-adding
- Sugar, fiber and sodium, plus Nutri-Score from Open Food Facts
