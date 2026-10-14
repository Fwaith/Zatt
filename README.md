# Track-er: "Should I eat this?"

Scan any food barcode and get **one clear answer**: ✅ Go for it · ⚠️ In moderation · ⛔ Don't eat,
personalised to your allergies, diet, daily goals and the product's expiry date. The app also suggests healthier swaps.

Data: [Open Food Facts](https://world.openfoodfacts.org). Storage: the browser (`localStorage`), so there's no backend.

## Run

```bash
npm install
npm run dev
```

The camera needs **HTTPS or localhost**. To use it on a phone, deploy to Vercel or Netlify (both configs are included,
and they also proxy the swap search). In the browser you can type a barcode or use the sample buttons.

## Features

| Feature | Where |
|---|---|
| Barcode scan + product lookup | Scan tab |
| **Search by name**: branded products ("coca cola") from Open Food Facts + ~35 built-in common foods ("rice", "chicken breast") | Scan tab search box |
| Custom amount with portion buttons (100 g, 1 breast, 1 cup…) + fixed "Per 100 g" line | Verdict screen |
| **Verdict**: one answer with the reasons behind it | Shown after every scan |
| Health grade (Nutri-Score A–E + NOVA processing level) | Verdict screen |
| Allergen profile + alerts (including "may contain" traces, phone vibration) | Profile → Verdict |
| Dietary filters (vegan, vegetarian, halal, gluten-free, dairy-free, low sugar, keto, no palm oil) | Profile → Verdict |
| Fits-your-day check (calories + sugar left today) | Verdict screen |
| Sugar cubes visual | Verdict screen |
| Healthier swaps (same category, better grade, safe for *your* profile) | Verdict screen |
| Product comparison | Verdict → swap "Compare", or History → ⚖️ Compare |
| Expiry date + "Use these first" | Verdict screen → History |
| Scan history | History tab |
| Daily + weekly trends (avg food grade, "Don't eat" items avoided, kcal chart) | Today tab |

## How the verdict works (`src/lib/verdict.js`)

Each check produces reasons rated `stop` / `caution` / `go` / `info`. **The worst reason decides the verdict.**

1. **Expiry**: expired → ⛔ · expires within 2 days → "eat it soon"
2. **Allergens**: contains or may contain one of your allergens → ⛔
3. **Diet**: e.g. non-vegan for a vegan → ⛔ · unclear → ⚠️
4. **Health**: Nutri-Score D/E → ⚠️ · ultra-processed (NOVA 4) and not otherwise healthy → ⚠️
5. **Your day**: over your calorie goal or sugar limit → ⚠️

Missing data gives "check the label" instead of a guess.

## Who owns what

| Person | Files |
|---|---|
| **A: Data + verdict** | `lib/food.js`, `lib/verdict.js`, `components/Scanner.jsx`, `ScanView.jsx`, `SwapSuggestion.jsx` |
| **B: Storage + insights** | `lib/profile.js`, `lib/history.js`, `lib/log.js`, `lib/storage.js`, `components/ProfileView.jsx`, `HistoryView.jsx`, `Dashboard.jsx` |
| **C: Screens + demo** | `App.jsx`, `components/VerdictCard.jsx`, `CompareView.jsx`, `Badges.jsx`, `styles.css`, pitch |

## 60-second demo script

1. **Profile**: tap 🥜 Peanuts. "I have a peanut allergy."
2. **Scan a Mars bar** → red ⛔ **Don't eat**: "May contain traces of peanuts", Nutri-Score E, 15 sugar cubes.
3. Scroll to **Healthier swaps** → tap **Compare** → 🏆 the swap wins.
4. **Scan the Alpro yogurt** → ✅ **Go for it** → set the expiry to tomorrow → **I ate this**.
5. **Today tab**: today's food grade A, "Don't eat" items avoided: 1.
6. **History**: "Use these first" shows the yogurt expiring tomorrow.

Sample barcodes: Nutella `3017620422003` · Mars `5000159407236` · Coca-Cola `5449000000996` · Alpro yogurt `5411188119098`

## Optional: more generic foods from USDA

Create `.env.local` with a free key from https://fdc.nal.usda.gov/api-key-signup:

```
VITE_USDA_API_KEY=your_key
```

USDA results then appear under "Common foods". Edit the built-in list in `src/lib/commonFoods.js`.

## Ideas if you have time

- Read the expiry date with the camera (OCR)
- "Snap a meal" for food without barcodes (AI photo → nutrition)
- Share a verdict card as an image
