// Owner: Person B — today's food diary, grouped by meal.
import { MEALS, macroTargets, mealOf } from "../lib/log.js";
import { LEVELS } from "../lib/verdict.js";

export default function DiaryView({ entries, totals, profile, onAdd, onRemove }) {
  const remaining = profile.goal - totals.kcal;
  const targets = macroTargets(profile.goal, profile.proteinGoal);

  return (
    <section className="stack">
      <div className="card equation">
        <p className="muted small">Calories remaining</p>
        <div className="equation-row">
          <span><b>{profile.goal}</b><small>Goal</small></span>
          <span className="op">−</span>
          <span><b>{totals.kcal}</b><small>Food</small></span>
          <span className="op">=</span>
          <span className={remaining < 0 ? "over-text" : "remaining"}>
            <b>{remaining}</b><small>Remaining</small>
          </span>
        </div>
      </div>

      {MEALS.map((meal) => {
        const items = entries.filter((e) => mealOf(e) === meal.id);
        const kcal = items.reduce((a, e) => a + e.kcal, 0);
        return (
          <div key={meal.id} className="card meal">
            <div className="meal-head">
              <h2>{meal.label}</h2>
              <span className="meal-kcal">{kcal}</span>
            </div>
            {items.length > 0 && (
              <ul className="meal-items">
                {items.map((e) => (
                  <li key={e.id}>
                    <div className="grow">
                      <p className="entry-name">
                        {e.name} {e.level && <span title={LEVELS[e.level].label}>{LEVELS[e.level].icon}</span>}
                      </p>
                      <p className="muted small">
                        {e.grams} g · P {e.protein} g · C {e.carbs} g · F {e.fat} g
                      </p>
                    </div>
                    <span className="entry-kcal">{e.kcal}</span>
                    <button className="icon-btn" aria-label={`Remove ${e.name}`} onClick={() => onRemove(e.id)}>×</button>
                  </li>
                ))}
              </ul>
            )}
            <button className="add-food" onClick={() => onAdd(meal.id)}>ADD FOOD</button>
          </div>
        );
      })}

      <div className="card totals-table">
        <h2>Daily totals</h2>
        <table>
          <thead>
            <tr><th /><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr>
          </thead>
          <tbody>
            <tr><td>Total</td><td>{totals.kcal}</td><td>{totals.protein}</td><td>{totals.carbs}</td><td>{totals.fat}</td></tr>
            <tr className="muted"><td>Goal</td><td>{profile.goal}</td><td>{targets.protein}</td><td>{targets.carbs}</td><td>{targets.fat}</td></tr>
            <tr>
              <td>Left</td>
              {[
                profile.goal - totals.kcal,
                targets.protein - totals.protein,
                targets.carbs - totals.carbs,
                targets.fat - totals.fat,
              ].map((v, i) => (
                <td key={i} className={v < 0 ? "over-text" : "remaining"}>{v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
