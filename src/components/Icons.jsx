// Owner: Person C — simple line icons (inherit currentColor).
const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const HomeIcon = (p) => (
  <svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h5v-6h4v6h5V9.5" /></svg>
);
export const DiaryIcon = (p) => (
  <svg {...base} {...p}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /><path d="M9 8h6" /></svg>
);
export const PlusIcon = (p) => (
  <svg {...base} strokeWidth={2.6} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const HistoryIcon = (p) => (
  <svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></svg>
);
export const UserIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const FlagIcon = (p) => (
  <svg {...base} {...p}><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>
);
export const ForkIcon = (p) => (
  <svg {...base} {...p}><path d="M7 3v8a2 2 0 0 0 2 2v8" /><path d="M11 3v8a2 2 0 0 1-2 2" /><path d="M17 21V3c-2 1-3 4-3 7s1 4 3 4" /></svg>
);
export const ScanIcon = (p) => (
  <svg {...base} {...p}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M8 9v6M11 9v6M14 9v6M17 9v6" /></svg>
);
