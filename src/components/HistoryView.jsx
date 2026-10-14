// Owner: Person B — scan history with expiry badges + pick two to compare.
import { useState } from "react";
import { timeAgo } from "../lib/history.js";
import { daysUntil, LEVELS } from "../lib/verdict.js";
import { GradeDot } from "./Badges.jsx";

function ExpiryBadge({ expiry }) {
  const d = daysUntil(expiry);
  if (d === null) return null;
  if (d < 0) return <span className="exp exp-bad">Expired</span>;
  if (d === 0) return <span className="exp exp-warn">Expires today</span>;
  if (d <= 3) return <span className="exp exp-warn">{d}d left</span>;
  return <span className="exp">{d}d left</span>;
}

export default function HistoryView({ history, onOpen, onCompare, onClear, onScan }) {
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState([]);

  const expiring = history
    .filter((h) => h.expiry && daysUntil(h.expiry) <= 3)
    .sort((x, y) => x.expiry.localeCompare(y.expiry));

  function tap(item) {
    if (!selecting) return onOpen(item);
    const next = picked.includes(item.barcode)
      ? picked.filter((b) => b !== item.barcode)
      : [...picked, item.barcode].slice(-2);
    setPicked(next);
    if (next.length === 2) {
      const [a, b] = next.map((code) => history.find((h) => h.barcode === code).food);
      onCompare(a, b);
      setPicked([]);
      setSelecting(false);
    }
  }

  if (history.length === 0) {
    return (
      <section className="card empty">
        <p className="muted">No scans yet.</p>
        <button className="btn" onClick={onScan}>Scan a product</button>
      </section>
    );
  }

  return (
    <section className="stack">
      {expiring.length > 0 && (
        <div className="card expiring">
          <h3>⏰ Use these first</h3>
          {expiring.map((h) => (
            <button key={h.barcode} className="expiring-row" onClick={() => onOpen(h)}>
              <span className="grow entry-name">{h.food.name}</span>
              <ExpiryBadge expiry={h.expiry} />
            </button>
          ))}
        </div>
      )}

      <div className="row">
        <h3 className="grow" style={{ margin: 0 }}>Scanned products</h3>
        <button
          className={`btn small ${selecting ? "" : "ghost"}`}
          onClick={() => { setSelecting(!selecting); setPicked([]); }}
        >
          {selecting ? `Pick ${2 - picked.length} more` : "⚖️ Compare"}
        </button>
      </div>

      <ul className="card history">
        {history.map((h) => (
          <li key={h.barcode}>
            <button className={`history-row ${picked.includes(h.barcode) ? "picked" : ""}`} onClick={() => tap(h)}>
              <span className="history-level" title={h.level ? LEVELS[h.level].label : ""}>
                {h.level ? LEVELS[h.level].icon : "•"}
              </span>
              {h.food.image ? <img src={h.food.image} alt="" /> : <div className="thumb">🍽️</div>}
              <span className="grow">
                <span className="entry-name">{h.food.name}</span>
                <span className="muted small">
                  {timeAgo(h.scannedAt)}{h.logged ? " · eaten" : ""}
                </span>
              </span>
              <ExpiryBadge expiry={h.expiry} />
              <GradeDot grade={h.food.nutriscore} />
            </button>
          </li>
        ))}
      </ul>

      <button className="link center" onClick={onClear}>Clear history</button>
    </section>
  );
}
