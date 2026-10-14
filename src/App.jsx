// Owner: Person C — app shell, navigation, top-level state.
import { useEffect, useMemo, useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import ScanView from "./components/ScanView.jsx";
import {
  entriesFor, loadEntries, loadGoal, makeEntry, saveEntries, saveGoal, totals,
} from "./lib/log.js";

export default function App() {
  const [view, setView] = useState("today"); // today | scan
  const [entries, setEntries] = useState(loadEntries);
  const [goal, setGoal] = useState(loadGoal);
  const [toast, setToast] = useState("");

  useEffect(() => saveEntries(entries), [entries]);
  useEffect(() => saveGoal(goal), [goal]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const today = useMemo(() => entriesFor(entries), [entries]);
  const todayTotals = useMemo(() => totals(today), [today]);

  function addFood(food, grams) {
    setEntries((prev) => [makeEntry(food, grams), ...prev]);
    setToast(`Added ${food.name}`);
    setView("today");
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>🥗 Track-er</h1>
        <span className="muted small">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </span>
      </header>

      <main>
        {view === "today" ? (
          <Dashboard
            entries={today}
            totals={todayTotals}
            goal={goal}
            onGoalChange={setGoal}
            onRemove={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
            onScan={() => setView("scan")}
          />
        ) : (
          <ScanView onAdd={addFood} />
        )}
      </main>

      <nav className="tabbar">
        <button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>
          <span>📊</span>Today
        </button>
        <button className={view === "scan" ? "active" : ""} onClick={() => setView("scan")}>
          <span>📷</span>Scan
        </button>
      </nav>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
