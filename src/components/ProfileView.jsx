// Owner: Person B — allergies, diets and goals.
import { ALLERGENS, DIETS, toggle } from "../lib/profile.js";

export default function ProfileView({ profile, onChange }) {
  const set = (patch) => onChange({ ...profile, ...patch });

  return (
    <section className="stack">
      <div className="card">
        <h3>🛡️ My allergies</h3>
        <p className="muted small hint">Products containing these (or traces of them) get a ⛔ alert.</p>
        <div className="chips">
          {ALLERGENS.map((a) => (
            <button
              key={a.id}
              className={`chip toggle ${profile.allergens.includes(a.id) ? "on danger" : ""}`}
              aria-pressed={profile.allergens.includes(a.id)}
              onClick={() => set({ allergens: toggle(profile.allergens, a.id) })}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>🥗 My diet</h3>
        <p className="muted small hint">We'll flag products that don't fit.</p>
        <div className="chips">
          {DIETS.map((d) => (
            <button
              key={d.id}
              className={`chip toggle ${profile.diets.includes(d.id) ? "on" : ""}`}
              aria-pressed={profile.diets.includes(d.id)}
              onClick={() => set({ diets: toggle(profile.diets, d.id) })}
            >
              {d.emoji} {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card stack-sm">
        <h3 style={{ margin: 0 }}>🎯 Daily goals</h3>
        <label className="field">
          <span>Calories (kcal)</span>
          <input
            type="number" min="500" step="50" value={profile.goal}
            onChange={(e) => set({ goal: Math.max(0, Number(e.target.value) || 0) })}
          />
        </label>
        <label className="field">
          <span>Sugar limit (g)</span>
          <input
            type="number" min="0" step="5" value={profile.sugarLimit}
            onChange={(e) => set({ sugarLimit: Math.max(0, Number(e.target.value) || 0) })}
          />
        </label>
      </div>

      <p className="muted small center">Saved automatically on this device.</p>
    </section>
  );
}
