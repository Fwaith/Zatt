// Owner: Person A — "Try this instead" suggestions.
import { useEffect, useState } from "react";
import { findSwaps } from "../lib/food.js";
import { isSafeFor } from "../lib/verdict.js";
import { GradeDot } from "./Badges.jsx";

export default function SwapSuggestion({ food, profile, onCompare, onOpen }) {
  const [state, setState] = useState({ status: "loading", swaps: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", swaps: [] });
    findSwaps(food, (f) => isSafeFor(f, profile))
      .then((swaps) => !cancelled && setState({ status: "done", swaps }))
      .catch(() => !cancelled && setState({ status: "done", swaps: [] }));
    return () => {
      cancelled = true;
    };
  }, [food.barcode, profile.allergens.join(), profile.diets.join()]);

  if (food.nutriscore === "a") return null;

  return (
    <div className="card swaps">
      <h3>💡 Healthier swaps</h3>
      {state.status === "loading" && <p className="muted small">Looking for better options…</p>}
      {state.status === "done" && state.swaps.length === 0 && (
        <p className="muted small">No better match found in this category.</p>
      )}
      <ul>
        {state.swaps.map((s) => (
          <li key={s.barcode}>
            <button className="swap-main" onClick={() => onOpen(s)}>
              {s.image ? <img src={s.image} alt="" /> : <div className="thumb">🍽️</div>}
              <span className="grow">
                <span className="entry-name">{s.name}</span>
                <span className="muted small">{s.brand || "—"}</span>
              </span>
              <GradeDot grade={s.nutriscore} />
            </button>
            <button className="btn ghost small" onClick={() => onCompare(food, s)}>Compare</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
