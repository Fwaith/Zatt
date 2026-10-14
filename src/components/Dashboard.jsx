// Owner: Person B — today's totals vs goal, entry list, weekly trends.
import { averageGrade, dailyTotals, entriesSince, macroTargets } from "../lib/log.js";
import { scannedWithin } from "../lib/history.js";
import { LEVELS } from "../lib/verdict.js";
import { GradeDot } from "./Badges.jsx";

export default function Dashboard({ allEntries, entries, totals, profile, history, onRemove, onScan }) {
  const { goal, sugarLimit } = profile;
  const targets = macroTargets(goal);
  const left = goal - totals.kcal;

  const week = dailyTotals(allEntries, 7);
  const weekEntries = entriesSince(allEntries, 7);
  const weekGrade = averageGrade(weekEntries);
  const todayGrade = averageGrade(entries);
  const avoided = scannedWithin(history, 7).filter((h) => h.level === "stop" && !h.logged).length;
  const maxKcal = Math.max(goal, ...week.map((d) => d.kcal)) || 1;

  return (
    <section className="stack">
      <div className="card summary">
        <Ring value={totals.kcal} max={goal} />
        <div className="summary-text">
          <p className="big">{Math.abs(left)}</p>
          <p className="muted">{left >= 0 ? "kcal left today" : "kcal over today"}</p>
          {todayGrade && (
            <p className="small day-grade">Today's food grade <GradeDot grade={todayGrade} /></p>
          )}
        </div>
      </div>

      <div className="card stack-sm">
        <MacroBar label="Protein" value={totals.protein} max={targets.protein} color="var(--protein)" />
        <MacroBar label="Carbs" value={totals.carbs} max={targets.carbs} color="var(--carbs)" />
        <MacroBar label="Fat" value={totals.fat} max={targets.fat} color="var(--fat)" />
        <MacroBar label="Sugar" value={totals.sugar} max={sugarLimit} color="var(--sugar)" warnOver />
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
                  <p className="entry-name">{e.level && LEVELS[e.level].icon} {e.name}</p>
                  <p className="muted small">{e.grams} g · P {e.protein} · C {e.carbs} · F {e.fat}</p>
                </div>
                <span className="entry-kcal">{e.kcal}</span>
                <button className="icon-btn" aria-label={`Remove ${e.name}`} onClick={() => onRemove(e.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>This week</h3>
        <div className="week-stats">
          <div className="week-stat">
            <span className="week-num">{weekGrade ? <GradeDot grade={weekGrade} /> : "–"}</span>
            <span className="muted small">Avg. food grade</span>
          </div>
          <div className="week-stat">
            <span className="week-num">🛡️ {avoided}</span>
            <span className="muted small">"Don't eat" items avoided</span>
          </div>
          <div className="week-stat">
            <span className="week-num">{Math.round(week.reduce((a, d) => a + d.kcal, 0) / 7)}</span>
            <span className="muted small">Avg. kcal / day</span>
          </div>
        </div>
        <div className="week-chart" role="img" aria-label="Calories per day this week">
          <div className="goal-line" style={{ bottom: `calc(18px + (100% - 18px) * ${goal / maxKcal})` }}>
            <span>goal</span>
          </div>
          {week.map((d) => (
            <div key={d.date} className="week-col">
              <div className="week-bar-wrap">
                <div
                  className={`week-bar ${d.kcal > goal ? "over" : ""}`}
                  style={{ height: `${(d.kcal / maxKcal) * 100}%` }}
                  title={`${d.kcal} kcal`}
                />
              </div>
              <span className="week-label">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ring({ value, max }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / (max || 1), 1);
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

function MacroBar({ label, value, max, color, warnOver }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  const over = warnOver && value > max;
  return (
    <div className="macro">
      <div className="macro-head">
        <span>{label}</span>
        <span className={over ? "over-text" : "muted"}>{value} / {max} g</span>
      </div>
      <div className="bar"><div style={{ width: `${pct}%`, background: over ? "var(--danger)" : color }} /></div>
    </div>
  );
}
