// Owner: Person C — the "Should I eat this?" screen.
import { useEffect, useState } from "react";
import { nutritionFor } from "../lib/food.js";
import { MEALS } from "../lib/log.js";
import { getVerdict, LEVELS } from "../lib/verdict.js";
import { NovaBadge, NutriScore, SugarCubes } from "./Badges.jsx";
import SwapSuggestion from "./SwapSuggestion.jsx";

export default function VerdictCard({
  food, profile, today, expiry, defaultMeal,
  onExpiryChange, onLevelChange, onLog, onBack, onCompare, onOpen,
}) {
  const [grams, setGrams] = useState(food.servingGrams);
  const [meal, setMeal] = useState(defaultMeal);
  const amount = Number(grams) || 0;
  const verdict = getVerdict(food, profile, { today, grams: amount, expiry });
  const meta = LEVELS[verdict.level];
  const n = nutritionFor(food, amount);

  useEffect(() => {
    onLevelChange?.(verdict.level);
  }, [verdict.level]);

  // Buzz the phone when the product is a hard "no".
  useEffect(() => {
    if (verdict.level === "stop") navigator.vibrate?.([200, 100, 200]);
  }, [food.barcode]);

  return (
    <section className="stack">
      <div className={`verdict v-${verdict.level}`}>
        <span className="verdict-icon">{meta.icon}</span>
        <div>
          <p className="verdict-q">Should I eat this?</p>
          <p className="verdict-label">{meta.label}</p>
        </div>
      </div>

      <div className="card product">
        <div className="product-head">
          {food.image ? <img src={food.image} alt="" /> : <div className="product-placeholder">{food.emoji || "🍽️"}</div>}
          <div className="grow">
            <h2>{food.name}</h2>
            {food.brand && <p className="muted">{food.brand}</p>}
          </div>
        </div>
        <div className="badges">
          <NutriScore grade={food.nutriscore} />
          <NovaBadge nova={food.nova} />
        </div>

        <ul className="reasons">
          {verdict.reasons.map((r, i) => (
            <li key={i} className={`r-${r.level}`}>
              <span>{{ stop: "⛔", caution: "⚠️", go: "✅", info: "ℹ️" }[r.level]}</span>
              {r.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="card stack-sm">
        <div className="row">
          <label className="field grow">
            <span>Amount (g)</span>
            <input type="number" min="1" inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} />
          </label>
          <label className="field grow">
            <span>Expiry date</span>
            <input type="date" value={expiry || ""} onChange={(e) => onExpiryChange(e.target.value || null)} />
          </label>
        </div>
        <div className="portions">
          {portionsFor(food).map((p) => (
            <button
              key={p.label}
              className={`chip toggle ${amount === p.grams ? "on" : ""}`}
              onClick={() => setGrams(p.grams)}
            >
              {p.label === "100 g" ? "100 g" : `${p.label} · ${p.grams} g`}
            </button>
          ))}
        </div>
        {food.hasNutrition && (
          <>
            <p className="per100">
              <b>Per 100 g:</b> {food.per100g.kcal} kcal · {food.per100g.protein} g protein ·{" "}
              {food.per100g.carbs} g carbs · {food.per100g.fat} g fat
            </p>
            <p className="portion-title">Your portion: {amount} g</p>
            <div className="macro-grid">
              <Stat label="Calories" value={n.kcal} unit="kcal" accent />
              <Stat label="Protein" value={n.protein} unit="g" />
              <Stat label="Carbs" value={n.carbs} unit="g" />
              <Stat label="Fat" value={n.fat} unit="g" />
            </div>
            <SugarCubes grams={n.sugar} />
          </>
        )}
      </div>

      <div className="card stack-sm">
        <p className="portion-title">Add to</p>
        <div className="segmented" role="radiogroup" aria-label="Meal">
          {MEALS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={meal === m.id}
              className={meal === m.id ? "on" : ""}
              onClick={() => setMeal(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <SwapSuggestion food={food} profile={profile} onCompare={onCompare} onOpen={onOpen} />

      <div className="row sticky-actions">
        <button className="btn ghost" onClick={onBack}>Back</button>
        <button
          className={`btn grow ${verdict.level === "stop" ? "danger" : ""}`}
          disabled={!(amount > 0)}
          onClick={() => onLog(food, amount, verdict.level, meal)}
        >
          {verdict.level === "stop" ? "Eat it anyway" : `Add to ${MEALS.find((m) => m.id === meal).label}`}
        </button>
      </div>
    </section>
  );
}

// Quick amount buttons: 100 g, the product's serving, and any common portions.
function portionsFor(food) {
  const list = [{ label: "100 g", grams: 100 }];
  if (food.portions?.length) list.push(...food.portions.filter((p) => p.grams !== 100));
  else if (food.servingGrams && food.servingGrams !== 100) list.push({ label: "1 serving", grams: food.servingGrams });
  return list;
}

function Stat({ label, value, unit, accent }) {
  return (
    <div className={`stat ${accent ? "accent" : ""}`}>
      <span className="stat-value">{value}<small>{unit}</small></span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
