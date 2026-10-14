// Owner: Person B — today's totals vs goal + entry list.
import { useState } from "react";
import { macroTargets } from "../lib/log.js";

export default function Dashboard({ entries, totals, goal, onGoalChange, onRemove, onScan }) {
  const targets = macroTargets(goal);
  const left = goal - totals.kcal;

  return (
    <section className="stack">
      <div className="card summary">
        <Ring value={totals.kcal} max={goal} />
        <div className="summary-text">
          <p className="big">{Math.abs(left)}</p>
          <p className="muted">{left >= 0 ? "kcal left" : "kcal over"}</p>
          <GoalEditor goal={goal} onChange={onGoalChange} />
        </div>
      </div>

      <div className="card stack-sm">
        <MacroBar label="Protein" value={totals.protein} max={targets.protein} color="var(--protein)" />
        <MacroBar label="Carbs" value={totals.carbs} max={targets.carbs} color="var(--carbs)" />
        <MacroBar label="Fat" value={totals.fat} max={targets.fat} color="var(--fat)" />
      </div>

      <div className="card">
        <h3>Today's food</h3>
        {entries.length === 0 ? (
          <div className="empty">
            <p className="muted">Nothing logged yet.</p>
            <button className="btn" onClick={onScan}>Scan your first item</button>
          </div>
        ) : (
          <ul className="entries">
            {entries.map((e) => (
              <li key={e.id}>
                {e.image ? <img src={e.image} alt="" /> : <div className="thumb">🍽️</div>}
                <div className="grow">
                  <p className="entry-name">{e.name}</p>
                  <p className="muted small">{e.grams} g · P {e.protein} · C {e.carbs} · F {e.fat}</p>
                </div>
                <span className="entry-kcal">{e.kcal}</span>
                <button className="icon-btn" aria-label={`Remove ${e.name}`} onClick={() => onRemove(e.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Ring({ value, max }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const over = value > max;
  return (
    <svg className="ring" viewBox="0 0 120 120" role="img" aria-label={`${value} of ${max} kcal`}>
      <circle cx="60" cy="60" r={r} className="ring-track" />
      <circle
        cx="60" cy="60" r={r}
        className={`ring-fill ${over ? "over" : ""}`}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
      />
      <text x="60" y="58" textAnchor="middle" className="ring-value">{value}</text>
      <text x="60" y="76" textAnchor="middle" className="ring-label">/ {max} kcal</text>
    </svg>
  );
}

function MacroBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="macro">
      <div className="macro-head">
        <span>{label}</span>
        <span className="muted">{value} / {max} g</span>
      </div>
      <div className="bar"><div style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

function GoalEditor({ goal, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);

  if (!editing) {
    return (
      <button className="link" onClick={() => { setDraft(goal); setEditing(true); }}>
        Goal: {goal} kcal ✎
      </button>
    );
  }
  return (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault();
        const n = Math.round(Number(draft));
        if (n > 0) onChange(n);
        setEditing(false);
      }}
    >
      <input type="number" min="1" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
      <button className="btn small">Save</button>
    </form>
  );
}
