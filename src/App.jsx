// Owner: Person C — app shell, navigation, top-level state.
import { useEffect, useMemo, useState } from "react";
import CompareView from "./components/CompareView.jsx";
import Dashboard from "./components/Dashboard.jsx";
import DiaryView from "./components/DiaryView.jsx";
import { DiaryIcon, HistoryIcon, HomeIcon, PlusIcon, UserIcon } from "./components/Icons.jsx";
import HistoryView from "./components/HistoryView.jsx";
import ProfileView from "./components/ProfileView.jsx";
import ScanView from "./components/ScanView.jsx";
import VerdictCard from "./components/VerdictCard.jsx";
import { loadHistory, recordScan, saveHistory, updateItem } from "./lib/history.js";
import { entriesFor, loadEntries, makeEntry, mealForTime, saveEntries, totals } from "./lib/log.js";
import { loadProfile, saveProfile } from "./lib/profile.js";

const TABS = [
  { id: "today", Icon: HomeIcon, label: "Dashboard", title: "Today" },
  { id: "diary", Icon: DiaryIcon, label: "Diary", title: "Diary" },
  { id: "scan", Icon: PlusIcon, label: "Add food", title: "Add food", fab: true },
  { id: "history", Icon: HistoryIcon, label: "History", title: "History" },
  { id: "profile", Icon: UserIcon, label: "Profile", title: "Profile" },
];

export default function App() {
  const [view, setView] = useState("scan");
  const [entries, setEntries] = useState(loadEntries);
  const [profile, setProfile] = useState(loadProfile);
  const [history, setHistory] = useState(loadHistory);
  const [current, setCurrent] = useState(null); // food shown on the verdict screen
  const [compare, setCompare] = useState(null); // [foodA, foodB]
  const [toast, setToast] = useState("");
  const [addMeal, setAddMeal] = useState(null); // meal chosen via a Diary "ADD FOOD" button

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

  function logFood(food, grams, level, meal) {
    setEntries((prev) => [makeEntry(food, grams, level, meal), ...prev]);
    setHistory((h) => updateItem(h, food.barcode, { logged: true }));
    setToast(`Added ${food.name}`);
    setCurrent(null);
    setAddMeal(null);
    setView("diary");
    window.scrollTo(0, 0);
  }

  function go(tab) {
    if (tab === "scan") setCurrent(null);
    if (tab !== "scan") setAddMeal(null);
    setView(tab);
    window.scrollTo(0, 0);
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
        onOpenDiary={() => go("diary")}
      />
    );
  } else if (view === "diary") {
    screen = (
      <DiaryView
        entries={today}
        totals={todayTotals}
        profile={profile}
        onAdd={(meal) => {
          setAddMeal(meal);
          go("scan");
        }}
        onRemove={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
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
        defaultMeal={addMeal || mealForTime()}
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
        <span className="brand">ZaTT</span>
        <span className="topbar-date">
          {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </header>
      <h1 className="page-title">
        {view === "scan" && addMeal && !current
          ? `Add to ${addMeal[0].toUpperCase()}${addMeal.slice(1)}`
          : TABS.find((t) => t.id === view).title}
      </h1>

      <main>{screen}</main>

      <nav className="tabbar">
        {TABS.map(({ id, Icon, label, fab }) => (
          <button
            key={id}
            className={`${view === id ? "active" : ""} ${fab ? "fab" : ""}`}
            aria-label={label}
            onClick={() => go(id)}
          >
            <span className="tab-icon"><Icon /></span>
            {!fab && <span className="tab-label">{label}</span>}
          </button>
        ))}
      </nav>

      {compare && <CompareView a={compare[0]} b={compare[1]} profile={profile} onClose={() => setCompare(null)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
