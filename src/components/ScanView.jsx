// Owner: Person A — scan screen: camera + manual entry + lookup state.
import { useState } from "react";
import Scanner from "./Scanner.jsx";
import { lookupBarcode } from "../lib/food.js";

const SAMPLES = [
  { label: "Nutella", code: "3017620422003" },
  { label: "Mars bar", code: "5000159407236" },
  { label: "Coca-Cola", code: "5449000000996" },
  { label: "Alpro yogurt", code: "5411188119098" },
];

export default function ScanView({ onFound, profileEmpty, onSetupProfile }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | notfound | error

  async function lookup(barcode) {
    setCode(barcode);
    setStatus("loading");
    try {
      const food = await lookupBarcode(barcode);
      if (food) onFound(food);
      else setStatus("notfound");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="stack">
      {profileEmpty && (
        <button className="card setup-banner" onClick={onSetupProfile}>
          <span>🛡️</span>
          <span className="grow">
            <b>Add your allergies & diet</b>
            <span className="muted small">Get personal "should I eat this?" alerts</span>
          </span>
          <span>›</span>
        </button>
      )}

      {status !== "loading" && <Scanner onDetected={lookup} />}
      {status === "loading" && <div className="card loading">🔎 Looking up {code}…</div>}

      <form
        className="card row"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) lookup(code);
        }}
      >
        <input
          inputMode="numeric"
          placeholder="Or type a barcode…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="btn" disabled={status === "loading"}>Check</button>
      </form>

      {status === "notfound" && (
        <div className="card notice">
          <p>No product found for <b>{code}</b>. Try another barcode.</p>
        </div>
      )}
      {status === "error" && (
        <div className="card notice">
          <p>Couldn't reach the food database. Check your connection.</p>
        </div>
      )}

      <div className="samples">
        <span className="muted">Try a sample:</span>
        {SAMPLES.map((s) => (
          <button key={s.code} className="chip" onClick={() => lookup(s.code)}>
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
