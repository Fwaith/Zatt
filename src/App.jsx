// Owner: Person C — app shell, navigation, top-level state.
import { useEffect, useMemo, useState } from "react";
import CompareView from "./components/CompareView.jsx";
import Dashboard from "./components/Dashboard.jsx";
import HistoryView from "./components/HistoryView.jsx";
import ProfileView from "./components/ProfileView.jsx";
import ScanView from "./components/ScanView.jsx";
import VerdictCard from "./components/VerdictCard.jsx";
import { loadHistory, recordScan, saveHistory, updateItem } from "./lib/history.js";
import { entriesFor, loadEntries, makeEntry, saveEntries, totals } from "./lib/log.js";
import { loadProfile, saveProfile } from "./lib/profile.js";

const TABS = [
  { id: "today", icon: "📊", label: "Today" },
  { id: "scan", icon: "📷", label: "Scan" },
  { id: "history", icon: "🕘", label: "History" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function App() {
  const [view, setView] = useState("scan");
  const [entries, setEntries] = useState(loadEntries);
  const [profile, setProfile] = useState(loadProfile);
  const [history, setHistory] = useState(loadHistory);
  const [current, setCurrent] = useState(null); // food shown on the verdict screen
  const [compare, setCompare] = useState(null); // [foodA, foodB]
  const [toast, setToast] = useState("");

  useEffect(() => saveEntries(entries), [entries]);
  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => saveHistory(history), [history]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const today = useMemo(() => entriesFor(entries), [entries]);
  const todayTotals = useMemo(() => totals(today), [today]);
  const currentItem = current && history.find((h) => h.barcode === current.barcode);

  function openFood(food, { record = true } = {}) {
    if (record) setHistory((h) => recordScan(h, food));
    setCurrent(food);
    setView("scan");
    window.scrollTo(0, 0);
  }

  function logFood(food, grams, level) {
    setEntries((prev) => [makeEntry(food, grams, level), ...prev]);
    setHistory((h) => updateItem(h, food.barcode, { logged: true }));
    setToast(`Logged ${food.name}`);
    setCurrent(null);
    setView("today");
  }

  function go(tab) {
    if (tab === "scan") setCurrent(null);
    setView(tab);
  }

  let screen;
  if (view === "today") {
    screen = (
      <Dashboard
        allEntries={entries}
        entries={today}
        totals={todayTotals}
        profile={profile}
        history={history}
        onRemove={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
        onScan={() => go("scan")}
      />
    );
  } else if (view === "scan" && current) {
    screen = (
      <VerdictCard
        key={current.barcode}
        food={current}
        profile={profile}
        today={todayTotals}
        expiry={currentItem?.expiry}
        onExpiryChange={(expiry) => setHistory((h) => updateItem(h, current.barcode, { expiry }))}
        onLevelChange={(level) =>
          setHistory((h) =>
            h.some((x) => x.barcode === current.barcode && x.level !== level)
              ? updateItem(h, current.barcode, { level })
              : h
          )
        }
        onLog={logFood}
        onBack={() => setCurrent(null)}
        onCompare={(a, b) => setCompare([a, b])}
        onOpen={(food) => openFood(food)}
      />
    );
  } else if (view === "scan") {
    screen = (
      <ScanView
        onFound={(food) => openFood(food)}
        profileEmpty={!profile.allergens.length && !profile.diets.length}
        onSetupProfile={() => go("profile")}
      />
    );
  } else if (view === "history") {
    screen = (
      <HistoryView
        history={history}
        onOpen={(item) => openFood(item.food, { record: false })}
        onCompare={(a, b) => setCompare([a, b])}
        onClear={() => confirm("Clear all scan history?") && setHistory([])}
        onScan={() => go("scan")}
      />
    );
  } else {
    screen = <ProfileView profile={profile} onChange={setProfile} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>🥗 Track-er</h1>
        <span className="muted small">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </span>
      </header>

      <main>{screen}</main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={view === t.id ? "active" : ""} onClick={() => go(t.id)}>
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {compare && <CompareView a={compare[0]} b={compare[1]} profile={profile} onClose={() => setCompare(null)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
