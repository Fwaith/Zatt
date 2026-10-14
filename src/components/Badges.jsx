// Owner: Person C — health grade badges + sugar cubes.

export function NutriScore({ grade, small }) {
  if (!grade) return <span className={`nutri none ${small ? "small" : ""}`}>Nutri-Score ?</span>;
  return (
    <span className={`nutri ${small ? "small" : ""}`} aria-label={`Nutri-Score ${grade.toUpperCase()}`}>
      {!small && <span className="nutri-label">Nutri-Score</span>}
      {["a", "b", "c", "d", "e"].map((g) => (
        <span key={g} className={`nutri-letter g-${g} ${g === grade ? "active" : ""}`}>
          {g.toUpperCase()}
        </span>
      ))}
    </span>
  );
}

const NOVA_TEXT = {
  1: "Unprocessed",
  2: "Processed ingredient",
  3: "Processed",
  4: "Ultra-processed",
};

export function NovaBadge({ nova }) {
  if (!nova) return null;
  return (
    <span className={`nova n-${nova}`}>
      <b>NOVA {nova}</b> {NOVA_TEXT[nova]}
    </span>
  );
}

export function GradeDot({ grade }) {
  return <span className={`grade-dot ${grade ? `g-${grade}` : "none"}`}>{grade ? grade.toUpperCase() : "?"}</span>;
}

const CUBE_GRAMS = 4;

export function SugarCubes({ grams }) {
  const cubes = Math.round(grams / CUBE_GRAMS);
  if (cubes < 1) return <p className="cubes muted small">🧊 Less than 1 sugar cube</p>;
  const shown = Math.min(cubes, 10);
  return (
    <div className="cubes" aria-label={`${cubes} sugar cubes`}>
      <span className="cubes-row">
        {"🧊".repeat(shown)}
        {cubes > shown && <b> +{cubes - shown}</b>}
      </span>
      <span className="small">
        <b>{cubes} sugar cube{cubes === 1 ? "" : "s"}</b> <span className="muted">({grams} g sugar)</span>
      </span>
    </div>
  );
}
