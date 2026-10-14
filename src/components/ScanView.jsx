// Owner: Person A — scan screen: camera, barcode entry, and food search by name.
import { useEffect, useState } from "react";
import Scanner from "./Scanner.jsx";
import { hasUsda, lookupBarcode, searchProducts, searchUsda } from "../lib/food.js";
import { searchCommonFoods } from "../lib/commonFoods.js";
import { GradeDot } from "./Badges.jsx";

const SAMPLES = [
  { label: "Nutella", code: "3017620422003" },
  { label: "Mars bar", code: "5000159407236" },
  { label: "Coca-Cola", code: "5449000000996" },
  { label: "Alpro yogurt", code: "5411188119098" },
];

const isBarcode = (text) => /^\d{8,14}$/.test(text.replace(/\s/g, ""));

export default function ScanView({ onFound, profileEmpty, onSetupProfile }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | notfound | error
  const [products, setProducts] = useState({ status: "idle", list: [] }); // idle | loading | done | error
  const [usda, setUsda] = useState([]);

  const text = query.trim();
  const searching = text.length >= 2 && !isBarcode(text);
  const common = searching ? searchCommonFoods(text) : [];

  // Search Open Food Facts (and USDA if configured) shortly after the user stops typing.
  useEffect(() => {
    if (!searching) {
      setProducts({ status: "idle", list: [] });
      setUsda([]);
      return;
    }
    let cancelled = false;
    setProducts({ status: "loading", list: [] });
    const t = setTimeout(() => {
      searchProducts(text)
        .then((list) => !cancelled && setProducts({ status: "done", list }))
        .catch(() => !cancelled && setProducts({ status: "error", list: [] }));
      if (hasUsda) searchUsda(text).then((list) => !cancelled && setUsda(list)).catch(() => {});
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [text, searching]);

  async function lookup(barcode) {
    setQuery(barcode);
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
      <form
        className="search-box"
        onSubmit={(e) => {
          e.preventDefault();
          if (isBarcode(text)) lookup(text);
          else if (common[0]) onFound(common[0]);
          else if (products.list[0]) onFound(products.list[0]);
        }}
      >
        <span className="search-icon">🔎</span>
        <input
          type="search"
          placeholder="Search a food (e.g. coca cola, rice) or barcode"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setStatus("idle");
          }}
        />
        {query && (
          <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => setQuery("")}>×</button>
        )}
      </form>

      {searching ? (
        <SearchResults common={common} usda={usda} products={products} onPick={onFound} />
      ) : (
        <>
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

          {status === "loading" ? (
            <div className="card loading">🔎 Looking up {text}…</div>
          ) : (
            <Scanner onDetected={lookup} />
          )}

          {isBarcode(text) && status === "idle" && (
            <button className="btn" onClick={() => lookup(text)}>Look up barcode {text}</button>
          )}
          {status === "notfound" && (
            <div className="card notice"><p>No product found for <b>{text}</b>. Try searching by name.</p></div>
          )}
          {status === "error" && (
            <div className="card notice"><p>Couldn't reach the food database. Check your connection.</p></div>
          )}

          <div className="samples">
            <span className="muted">Try a sample:</span>
            {SAMPLES.map((s) => (
              <button key={s.code} className="chip" onClick={() => lookup(s.code)}>{s.label}</button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function SearchResults({ common, usda, products, onPick }) {
  const generic = [...common, ...usda];
  const nothing = !generic.length && products.status === "done" && !products.list.length;

  return (
    <div className="stack">
      {generic.length > 0 && (
        <div className="card results">
          <h3>Common foods</h3>
          <ul>
            {generic.map((f) => (
              <li key={f.barcode}>
                <ResultRow food={f} onPick={onPick} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card results">
        <h3>Products</h3>
        {products.status === "loading" && <p className="muted small">Searching Open Food Facts…</p>}
        {products.status === "error" && <p className="muted small">Product search is unavailable right now.</p>}
        {products.status === "done" && !products.list.length && <p className="muted small">No products found.</p>}
        <ul>
          {products.list.map((f) => (
            <li key={f.barcode}>
              <ResultRow food={f} onPick={onPick} />
            </li>
          ))}
        </ul>
      </div>

      {nothing && <p className="muted small center">Tip: try a simpler name, like "rice" or "cola".</p>}
    </div>
  );
}

function ResultRow({ food, onPick }) {
  return (
    <button className="result-row" onClick={() => onPick(food)}>
      {food.image ? <img src={food.image} alt="" /> : <span className="thumb">{food.emoji || "🍽️"}</span>}
      <span className="grow">
        <span className="entry-name">{food.name}</span>
        <span className="muted small">
          {food.brand ? `${food.brand} · ` : ""}{food.per100g.kcal} kcal / 100 g
        </span>
      </span>
      {food.source !== "common" && food.source !== "usda" && <GradeDot grade={food.nutriscore} />}
    </button>
  );
}
