import { useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { ChatView } from "./components/ChatView";
import { Composer } from "./components/Composer";
import { useChat } from "./hooks/useChat";
import { useRecorder } from "./hooks/useRecorder";
import { i18n } from "./i18n";
import type { Lang, Theme } from "./types";
import { applyTheme, getStoredTheme, setStoredTheme } from "./theme";
import { api } from "./api";

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem("hermes_lang");
      if (s === "ru" || s === "en") return s;
    } catch {
      /* ignore */
    }
    return "ru";
  });
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  const t = (k: keyof typeof i18n.ru) => i18n[lang][k];
  const { messages, thinking, error, send } = useChat();
  const [playing, setPlaying] = useState<HTMLAudioElement | null>(null);

  const handleAudio = useCallback(
    async (b64: string) => {
      try {
        const res = await api.stt(b64, null);
        if (res.text?.trim()) send(res.text.trim());
      } catch (e) {
        console.error("STT error", e);
      }
    },
    [send],
  );

  const { recording, start, stop } = useRecorder(handleAudio);

  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
  }, [theme]);
  useEffect(() => {
    try {
      localStorage.setItem("hermes_lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const onPlay = (audio: HTMLAudioElement) => {
    playing?.pause();
    audio.play();
    setPlaying(audio);
  };

  return (
    <div className="app">
      <Header
        lang={lang}
        theme={theme}
        onToggleLang={() => setLang(lang === "ru" ? "en" : "ru")}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        t={t}
      />
      <ChatView
        messages={messages}
        thinking={thinking}
        thinkingText={t("thinking")}
        onPlay={onPlay}
      />
      {error && (
        <div className="error">
          {t("errNet")}
          {error}
        </div>
      )}
      <Composer
        onSend={send}
        onUpload={async (f) => {
          try {
            await api.upload(f);
          } catch (e) {
            console.error(e);
          }
        }}
        onAudio={handleAudio}
        recording={recording}
        onToggleRec={() => (recording ? stop() : start())}
        placeholder={t("placeholder")}
        sendLabel={t("send")}
      />
    </div>
  );
}
