// Owner: Person C — product detail + portion picker.
import { useState } from "react";
import { nutritionFor } from "../lib/food.js";

export default function ProductCard({ food, onAdd, onCancel }) {
  const [grams, setGrams] = useState(food.servingGrams);
  const n = nutritionFor(food, Number(grams) || 0);

  return (
    <section className="card product">
      <div className="product-head">
        {food.image ? (
          <img src={food.image} alt="" />
        ) : (
          <div className="product-placeholder">🍽️</div>
        )}
        <div>
          <h2>{food.name}</h2>
          {food.brand && <p className="muted">{food.brand}</p>}
          <p className="muted small">{food.per100g.kcal} kcal / 100 g</p>
        </div>
      </div>

      <label className="field">
        <span>Amount (g)</span>
        <input
          type="number"
          min="1"
          inputMode="decimal"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
        />
      </label>

      <div className="macro-grid">
        <Stat label="Calories" value={n.kcal} unit="kcal" accent />
        <Stat label="Protein" value={n.protein} unit="g" />
        <Stat label="Carbs" value={n.carbs} unit="g" />
        <Stat label="Fat" value={n.fat} unit="g" />
      </div>

      <div className="row">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn grow" disabled={!(Number(grams) > 0)} onClick={() => onAdd(Number(grams))}>
          Add to today
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value, unit, accent }) {
  return (
    <div className={`stat ${accent ? "accent" : ""}`}>
      <span className="stat-value">{value}<small>{unit}</small></span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
