// Owner: Person B — today's calories + macros vs goals, weekly trends.
import { averageGrade, dailyTotals, entriesSince, macroTargets } from "../lib/log.js";
import { scannedWithin } from "../lib/history.js";
import { GradeDot } from "./Badges.jsx";
import { FlagIcon, ForkIcon } from "./Icons.jsx";

export default function Dashboard({ allEntries, entries, totals, profile, history, onOpenDiary }) {
  const { goal, sugarLimit, proteinGoal } = profile;
  const targets = macroTargets(goal, proteinGoal);
  const remaining = goal - totals.kcal;

  const week = dailyTotals(allEntries, 7);
  const weekGrade = averageGrade(entriesSince(allEntries, 7));
  const todayGrade = averageGrade(entries);
  const avoided = scannedWithin(history, 7).filter((h) => h.level === "stop" && !h.logged).length;
  const maxKcal = Math.max(goal, ...week.map((d) => d.kcal)) || 1;

  return (
    <section className="stack">
      <div className="card">
        <div className="card-title">
          <h2>Calories</h2>
          <p className="muted small">Remaining = Goal − Food</p>
        </div>
        <div className="calories">
          <Ring value={totals.kcal} max={goal} size={140} stroke={12} over={remaining < 0}>
            <span className="ring-big">{Math.abs(remaining)}</span>
            <span className="ring-small">{remaining >= 0 ? "Remaining" : "Over"}</span>
          </Ring>
          <ul className="cal-legend">
            <li>
              <FlagIcon className="legend-icon" />
              <span><span className="muted small">Base Goal</span><b>{goal}</b></span>
            </li>
            <li>
              <ForkIcon className="legend-icon food" />
              <span><span className="muted small">Food</span><b>{totals.kcal}</b></span>
            </li>
            <li>
              <span className="legend-icon grade"><GradeDot grade={todayGrade} /></span>
              <span><span className="muted small">Food grade</span><b>{todayGrade ? todayGrade.toUpperCase() : "–"}</b></span>
            </li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <h2>Macros</h2>
          <button className="link" onClick={onOpenDiary}>View diary ›</button>
        </div>
        <div className="macro-rings">
          <MacroRing label="Protein" value={totals.protein} max={targets.protein} color="var(--protein)" />
          <MacroRing label="Carbs" value={totals.carbs} max={targets.carbs} color="var(--carbs)" />
          <MacroRing label="Fat" value={totals.fat} max={targets.fat} color="var(--fat)" />
          <MacroRing label="Sugar" value={totals.sugar} max={sugarLimit} color="var(--sugar)" limit />
        </div>
        <ProteinBar value={totals.protein} goal={proteinGoal} />
      </div>

      <div className="card">
        <div className="card-title">
          <h2>This week</h2>
        </div>
        <div className="week-stats">
          <div className="week-stat">
            <span className="week-num">{weekGrade ? <GradeDot grade={weekGrade} /> : "–"}</span>
            <span className="muted small">Avg. food grade</span>
          </div>
          <div className="week-stat">
            <span className="week-num">{avoided}</span>
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

function Ring({ value, max, size, stroke, color, over, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / (max || 1), 1);
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" style={{ strokeWidth: stroke }} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className={`ring-fill ${over ? "over" : ""}`}
          style={{ strokeWidth: stroke, ...(color && !over ? { stroke: color } : {}) }}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

function MacroRing({ label, value, max, color, limit }) {
  const over = limit && value > max;
  const left = max - value;
  return (
    <div className="macro-ring">
      <span className="macro-ring-label" style={{ color }}>{label}</span>
      <Ring value={value} max={max} size={64} stroke={7} color={color} over={over}>
        <span className="ring-mid">{value}</span>
        <span className="ring-tiny">/{max}g</span>
      </Ring>
      <span className={`small ${over ? "over-text" : "muted"}`}>
        {limit ? (over ? `${-left}g over` : `${left}g left`) : left > 0 ? `${left}g left` : "Done ✓"}
      </span>
    </div>
  );
}

function ProteinBar({ value, goal }) {
  if (!goal) return null;
  const pct = Math.min(Math.round((value / goal) * 100), 100);
  const done = value >= goal;
  return (
    <div className="protein-goal">
      <div className="macro-head">
        <span><b>Protein goal</b> <span className="muted">{value} / {goal} g</span></span>
        <span className={done ? "done-text" : "muted"}>
          {done ? "Goal reached 💪" : `${goal - value} g to go`}
        </span>
      </div>
      <div className="bar"><div style={{ width: `${pct}%`, background: "var(--protein)" }} /></div>
    </div>
  );
}
