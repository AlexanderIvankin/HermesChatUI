import type { Lang, Theme } from "../types";

interface Props {
  lang: Lang;
  theme: Theme;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  t: (k: keyof typeof import("../i18n").i18n.ru) => string;
}

export function Header({ lang, theme, onToggleLang, onToggleTheme, t }: Props) {
  return (
    <header className="header">
      <div className="avatar">
        <img src="/images/hermes_avatar.jpg" alt="Hermes" />
      </div>
      <div className="title">
        <h1>Hermes</h1>
        <div className="status">
          <span className="dot" /> {t("status")}
        </div>
      </div>
      <div className="actions">
        <button className="themeBtn" onClick={onToggleTheme} title="Тема">
          {theme === "dark" ? <span>🌙</span> : <span>☀️</span>}
        </button>
        <button className="langBtn" onClick={onToggleLang} title="Язык">
          {lang === "ru" ? "EN" : "RU"}
        </button>
      </div>
    </header>
  );
}
