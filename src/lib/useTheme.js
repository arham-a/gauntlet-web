import { useCallback, useEffect, useState } from "react";

/*
  Three states, not two: "system" leaves the document unstamped so the OS
  preference decides, while "light" and "dark" stamp data-theme and win over it.
*/
const KEY = "gauntlet-theme";
const isValid = (v) => v === "light" || v === "dark" || v === "system";

function apply(mode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}

export function useTheme() {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "system";
    const saved = window.localStorage.getItem(KEY);
    return isValid(saved) ? saved : "system";
  });

  useEffect(() => {
    apply(mode);
    try {
      window.localStorage.setItem(KEY, mode);
    } catch {
      /* storage can be unavailable in private mode; the theme still applies */
    }
  }, [mode]);

  // Cycles light -> dark -> system, which keeps the control to a single button.
  const cycle = useCallback(() => {
    setMode((m) => (m === "light" ? "dark" : m === "dark" ? "system" : "light"));
  }, []);

  return { mode, setMode, cycle };
}

/** Run before React mounts so the first paint is already in the right theme. */
export function initTheme() {
  try {
    const saved = window.localStorage.getItem(KEY);
    if (isValid(saved)) apply(saved);
  } catch {
    /* ignore */
  }
}
