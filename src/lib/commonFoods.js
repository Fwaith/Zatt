// Owner: Person A — built-in generic foods (no barcode), per 100 g.
// Values are USDA FoodData Central reference values (rounded). Instant, offline, no rate limits.

const RAW = [
  // id, name, emoji, aliases, [kcal, protein, carbs, fat, sugar, satFat], portions, extra
  ["chicken-breast-cooked", "Chicken breast, cooked", "🍗", "chicken breast grilled roasted", [165, 31, 0, 3.6, 0, 1], [["1 breast", 120]], { nova: 1, meat: true }],
  ["chicken-breast-raw", "Chicken breast, raw", "🍗", "chicken breast uncooked", [120, 22.5, 0, 2.6, 0, 0.6], [["1 breast", 170]], { nova: 1, meat: true }],
  ["chicken-thigh-cooked", "Chicken thigh, cooked", "🍗", "chicken thigh", [209, 26, 0, 10.9, 0, 3], [["1 thigh", 100]], { nova: 1, meat: true }],
  ["beef-mince-cooked", "Beef mince (85% lean), cooked", "🥩", "beef ground mince minced hamburger", [250, 25.9, 0, 15.4, 0, 5.9], [["1 portion", 100]], { nova: 1, meat: true }],
  ["steak-cooked", "Beef steak, cooked", "🥩", "steak sirloin beef", [217, 30, 0, 10, 0, 4], [["1 steak", 180]], { nova: 1, meat: true }],
  ["salmon-cooked", "Salmon, cooked", "🐟", "salmon fish fillet", [206, 22.1, 0, 12.4, 0, 2.5], [["1 fillet", 150]], { nova: 1, allergens: ["fish"], meat: true }],
  ["tuna-canned", "Tuna, canned in water", "🐟", "tuna fish can", [116, 25.5, 0, 0.8, 0, 0.2], [["1 can (drained)", 120]], { nova: 3, allergens: ["fish"], meat: true }],
  ["shrimp-cooked", "Shrimp / prawns, cooked", "🦐", "shrimp prawn prawns", [99, 24, 0.2, 0.3, 0, 0.1], [["1 portion", 100]], { nova: 1, allergens: ["crustaceans"], meat: true }],
  ["egg-boiled", "Egg, boiled", "🥚", "egg eggs hard boiled", [155, 12.6, 1.1, 10.6, 1.1, 3.3], [["1 large egg", 50], ["2 eggs", 100]], { nova: 1, allergens: ["eggs"], vegetarian: true }],
  ["egg-fried", "Egg, fried", "🍳", "egg eggs fried", [196, 13.6, 0.8, 15, 0.4, 4.3], [["1 large egg", 46]], { nova: 1, allergens: ["eggs"], vegetarian: true }],
  ["tofu-firm", "Tofu, firm", "🧈", "tofu bean curd soy", [144, 17.3, 2.8, 8.7, 0.6, 1.3], [["1 block slice", 100]], { nova: 3, allergens: ["soybeans"], vegan: true }],
  ["lentils-cooked", "Lentils, boiled", "🫘", "lentils dal dhal", [116, 9, 20.1, 0.4, 1.8, 0.1], [["1 cup", 198]], { nova: 1, vegan: true }],
  ["white-rice-cooked", "White rice, cooked", "🍚", "rice white steamed boiled", [130, 2.7, 28.2, 0.3, 0.1, 0.1], [["1 cup", 158], ["1 bowl", 200]], { nova: 1, vegan: true }],
  ["white-rice-raw", "White rice, uncooked", "🍚", "rice white dry uncooked raw", [365, 7.1, 80, 0.7, 0.1, 0.2], [["1/4 cup", 46]], { nova: 1, vegan: true }],
  ["brown-rice-cooked", "Brown rice, cooked", "🍚", "rice brown wholegrain", [123, 2.7, 25.6, 1, 0.2, 0.2], [["1 cup", 195]], { nova: 1, vegan: true }],
  ["pasta-cooked", "Pasta, cooked", "🍝", "pasta spaghetti penne macaroni noodles", [158, 5.8, 30.9, 0.9, 0.6, 0.2], [["1 cup", 140], ["1 plate", 250]], { nova: 1, allergens: ["gluten"], vegan: true }],
  ["egg-noodles-cooked", "Egg noodles, cooked", "🍜", "noodles egg", [138, 4.5, 25.2, 2.1, 0.4, 0.4], [["1 cup", 160]], { nova: 1, allergens: ["gluten", "eggs"], vegetarian: true }],
  ["white-bread", "White bread", "🍞", "bread toast white slice", [265, 9, 49, 3.2, 5, 0.7], [["1 slice", 30], ["2 slices", 60]], { nova: 3, allergens: ["gluten"], vegan: true }],
  ["wholemeal-bread", "Wholemeal bread", "🍞", "bread wholemeal whole wheat brown toast", [247, 13, 41, 3.4, 6, 0.7], [["1 slice", 32]], { nova: 3, allergens: ["gluten"], vegan: true }],
  ["oats", "Oats, rolled (dry)", "🥣", "oats oatmeal porridge rolled", [379, 13.2, 67.7, 6.5, 1, 1.1], [["1 serving", 40]], { nova: 1, allergens: ["gluten"], vegan: true }],
  ["potato-boiled", "Potato, boiled", "🥔", "potato potatoes boiled", [87, 1.9, 20.1, 0.1, 0.9, 0], [["1 medium", 170]], { nova: 1, vegan: true }],
  ["sweet-potato-baked", "Sweet potato, baked", "🍠", "sweet potato yam", [90, 2, 20.7, 0.2, 6.5, 0.1], [["1 medium", 150]], { nova: 1, vegan: true }],
  ["banana", "Banana", "🍌", "banana", [89, 1.1, 22.8, 0.3, 12.2, 0.1], [["1 medium", 118]], { nova: 1, vegan: true }],
  ["apple", "Apple", "🍎", "apple", [52, 0.3, 13.8, 0.2, 10.4, 0], [["1 medium", 182]], { nova: 1, vegan: true }],
  ["orange", "Orange", "🍊", "orange", [47, 0.9, 11.8, 0.1, 9.4, 0], [["1 medium", 131]], { nova: 1, vegan: true }],
  ["avocado", "Avocado", "🥑", "avocado", [160, 2, 8.5, 14.7, 0.7, 2.1], [["1/2 avocado", 100]], { nova: 1, vegan: true }],
  ["broccoli", "Broccoli", "🥦", "broccoli", [34, 2.8, 6.6, 0.4, 1.7, 0], [["1 cup", 91]], { nova: 1, vegan: true }],
  ["spinach", "Spinach, raw", "🥬", "spinach greens", [23, 2.9, 3.6, 0.4, 0.4, 0.1], [["1 cup", 30]], { nova: 1, vegan: true }],
  ["carrot", "Carrot", "🥕", "carrot carrots", [41, 0.9, 9.6, 0.2, 4.7, 0], [["1 medium", 61]], { nova: 1, vegan: true }],
  ["tomato", "Tomato", "🍅", "tomato tomatoes", [18, 0.9, 3.9, 0.2, 2.6, 0], [["1 medium", 123]], { nova: 1, vegan: true }],
  ["milk-whole", "Milk, whole", "🥛", "milk whole full fat", [61, 3.2, 4.8, 3.3, 5.1, 1.9], [["1 glass", 244]], { nova: 1, allergens: ["milk"], vegetarian: true }],
  ["greek-yogurt", "Greek yogurt, plain non-fat", "🥣", "greek yogurt yoghurt plain", [59, 10.2, 3.6, 0.4, 3.2, 0.1], [["1 pot", 170]], { nova: 1, allergens: ["milk"], vegetarian: true }],
  ["cheddar", "Cheddar cheese", "🧀", "cheese cheddar", [403, 24.9, 1.3, 33.1, 0.5, 21.1], [["1 slice", 28]], { nova: 3, allergens: ["milk"], vegetarian: true }],
  ["almonds", "Almonds", "🌰", "almonds nuts", [579, 21.2, 21.6, 49.9, 4.4, 3.8], [["1 handful", 28]], { nova: 1, allergens: ["nuts"], vegan: true }],
  ["peanut-butter", "Peanut butter", "🥜", "peanut butter", [588, 25, 20, 50, 9.2, 10], [["1 tbsp", 16]], { nova: 3, allergens: ["peanuts"], vegan: true }],
];

function toFood([id, name, emoji, aliases, [kcal, protein, carbs, fat, sugar, satFat], portions, extra]) {
  const analysis = extra.vegan ? ["vegan", "vegetarian"] : extra.vegetarian ? ["non-vegan", "vegetarian"] : ["non-vegan", "non-vegetarian"];
  return {
    barcode: `food:${id}`,
    name,
    brand: "Common food",
    image: "",
    emoji,
    servingGrams: portions[0][1],
    portions: portions.map(([label, grams]) => ({ label, grams })),
    hasNutrition: true,
    per100g: { kcal, protein, carbs, fat, sugar, satFat, salt: 0 },
    nutriscore: null,
    nova: extra.nova ?? null,
    allergens: extra.allergens ?? [],
    traces: [],
    analysis,
    labels: [],
    categories: [],
    ingredientsText: name.toLowerCase(),
    source: "common",
    _search: `${name} ${aliases}`.toLowerCase(),
  };
}

export const COMMON_FOODS = RAW.map(toFood);

/** Every word of the query must appear in the food's name or aliases. */
export function searchCommonFoods(query, limit = 6) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return COMMON_FOODS.filter((f) => words.every((w) => f._search.includes(w))).slice(0, limit);
}
