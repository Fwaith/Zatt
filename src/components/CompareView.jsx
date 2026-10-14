// Owner: Person C — side-by-side product comparison.
import { GRADE_RANK } from "../lib/food.js";
import { getVerdict, LEVELS } from "../lib/verdict.js";
import { GradeDot } from "./Badges.jsx";

const ROWS = [
  { label: "Nutri-Score", get: (f) => GRADE_RANK[f.nutriscore], show: (f) => <GradeDot grade={f.nutriscore} />, better: "low" },
  { label: "Processing", get: (f) => f.nova, show: (f) => (f.nova ? `NOVA ${f.nova}` : "?"), better: "low" },
  { label: "Calories", get: (f) => f.per100g.kcal, unit: "kcal", better: "low" },
  { label: "Sugar", get: (f) => f.per100g.sugar, unit: "g", better: "low" },
  { label: "Sat. fat", get: (f) => f.per100g.satFat, unit: "g", better: "low" },
  { label: "Salt", get: (f) => f.per100g.salt, unit: "g", better: "low" },
  { label: "Protein", get: (f) => f.per100g.protein, unit: "g", better: "high" },
];

function winner(row, a, b) {
  const x = row.get(a);
  const y = row.get(b);
  if (x == null || y == null || x === y) return null;
  return (row.better === "low") === x < y ? "a" : "b";
}

export default function CompareView({ a, b, profile, onClose }) {
  const va = getVerdict(a, profile);
  const vb = getVerdict(b, profile);
  const wins = { a: 0, b: 0 };
  const results = ROWS.map((row) => {
    const w = winner(row, a, b);
    if (w) wins[w]++;
    return w;
  });
  const levelRank = { go: 0, caution: 1, stop: 2 };
  // Safety first: a product that's a "stop" for this user never wins.
  const best =
    levelRank[va.level] !== levelRank[vb.level]
      ? levelRank[va.level] < levelRank[vb.level] ? a : b
      : wins.a === wins.b ? null : wins.a > wins.b ? a : b;

  return (
    <div className="overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Compare</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>×</button>
        </div>

        {best && (
          <p className="compare-winner">
            🏆 <b>{best.name}</b> is the better choice for you
          </p>
        )}

        <table className="compare">
          <thead>
            <tr>
              <th />
              {[a, b].map((f) => (
                <th key={f.barcode}>
                  {f.image ? <img src={f.image} alt="" /> : <div className="thumb">🍽️</div>}
                  <span>{f.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>For you</td>
              {[va, vb].map((v, i) => (
                <td key={i} className={`v-text-${v.level}`}>{LEVELS[v.level].icon} {LEVELS[v.level].label}</td>
              ))}
            </tr>
            {ROWS.map((row, i) => (
              <tr key={row.label}>
                <td>{row.label}{row.unit && <span className="muted small"> /100g</span>}</td>
                {[a, b].map((f, j) => (
                  <td key={j} className={results[i] === (j === 0 ? "a" : "b") ? "win" : ""}>
                    {row.show ? row.show(f) : `${+row.get(f).toFixed(1)} ${row.unit}`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
