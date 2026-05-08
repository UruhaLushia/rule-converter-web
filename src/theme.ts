export function installSystemTheme() {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    const theme = query.matches ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.style.colorScheme = theme;
  };

  apply();
  query.addEventListener("change", apply);
}
