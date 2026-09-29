import type { Theme } from "./types";

const KEY = "hermes_theme";

export function getStoredTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "dark" || t === "light") return t;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function setStoredTheme(t: Theme): void {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
}

export function applyTheme(t: Theme): void {
  document.body.classList.toggle("theme-dark", t === "dark");
  document.body.classList.toggle("theme-light", t === "light");
}
