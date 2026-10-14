// Owner: Person A — scan screen: camera + manual entry + lookup state.
import { useState } from "react";
import Scanner from "./Scanner.jsx";
import ProductCard from "./ProductCard.jsx";
import { lookupBarcode } from "../lib/food.js";

const SAMPLES = [
  { label: "Nutella", code: "3017620422003" },
  { label: "Coca-Cola", code: "5449000000996" },
];

export default function ScanView({ onAdd }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | found | notfound | error
  const [food, setFood] = useState(null);
  const [scanKey, setScanKey] = useState(0);

  async function lookup(barcode) {
    setCode(barcode);
    setStatus("loading");
    try {
      const result = await lookupBarcode(barcode);
      setFood(result);
      setStatus(result ? "found" : "notfound");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setFood(null);
    setStatus("idle");
    setCode("");
    setScanKey((k) => k + 1); // remount scanner
  }

  if (status === "found" && food) {
    return (
      <ProductCard
        food={food}
        onAdd={(grams) => {
          onAdd(food, grams);
          reset();
        }}
        onCancel={reset}
      />
    );
  }

  return (
    <section className="stack">
      {status === "idle" && <Scanner key={scanKey} onDetected={lookup} />}

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
        <button className="btn" disabled={status === "loading"}>
          {status === "loading" ? "…" : "Look up"}
        </button>
      </form>

      {status === "notfound" && (
        <div className="card notice">
          <p>No product found for <b>{code}</b>.</p>
          <button className="btn ghost" onClick={reset}>Scan again</button>
        </div>
      )}
      {status === "error" && (
        <div className="card notice">
          <p>Couldn't reach the food database. Check your connection.</p>
          <button className="btn ghost" onClick={reset}>Try again</button>
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
