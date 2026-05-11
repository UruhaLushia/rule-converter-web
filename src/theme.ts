export type ThemePreference = "auto" | "light" | "dark";

const THEME_STORAGE_KEY = "rule-converter-web-theme";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

export function getThemePreference(): ThemePreference {
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : "auto";
}

export function setThemePreference(preference: ThemePreference) {
  if (preference === "auto") {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }
  applyThemePreference(preference);
}

export function installTheme() {
  const query = window.matchMedia(SYSTEM_THEME_QUERY);
  const applyStoredPreference = () =>
    applyThemePreference(getThemePreference());

  applyStoredPreference();
  query.addEventListener("change", applyStoredPreference);
}

function applyThemePreference(preference: ThemePreference) {
  const theme =
    preference === "auto"
      ? window.matchMedia(SYSTEM_THEME_QUERY).matches
        ? "dark"
        : "light"
      : preference;

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.dataset.themeMode = preference;
  document.documentElement.style.colorScheme = theme;
}
