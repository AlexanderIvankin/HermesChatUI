import { useState } from "react";
import { api } from "../api";
import type { ChatMessage } from "../types";

interface Props {
  msg: ChatMessage;
  onPlay: (audio: HTMLAudioElement) => void;
}

function parseMarkers(text: string) {
  const files: string[] = [];
  const images: string[] = [];
  let clean = text.replace(/\[Download:\s*([^\]\n]+)\]/gi, (_, n) => {
    files.push(n.trim());
    return "";
  });
  clean = clean.replace(/\[ImageSaved:\s*([^\]\n]+)\]/gi, (_, n) => {
    images.push(n.trim());
    return "";
  });
  return { clean: clean.replace(/\n{3,}/g, "\n\n").trim(), files, images };
}

export function Message({ msg, onPlay }: Props) {
  const [busy, setBusy] = useState(false);
  const parsed =
    msg.who === "hermes"
      ? parseMarkers(msg.text)
      : { clean: msg.text, files: [], images: [] };

  async function speak() {
    if (!parsed.clean) return;
    setBusy(true);
    try {
      const blob = await api.tts(parsed.clean);
      const audio = new Audio(URL.createObjectURL(blob));
      onPlay(audio);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`msg-wrap ${msg.who}`}>
      <div className={`msg ${msg.who}`}>
        <div className="msgText">{parsed.clean || " "}</div>

        {parsed.images.map((n) => (
          <img
            key={n}
            className="genImg"
            src={`/images/${encodeURIComponent(n)}`}
            alt="generated"
            loading="lazy"
            onClick={() =>
              window.open(`/images/${encodeURIComponent(n)}`, "_blank")
            }
          />
        ))}

        {parsed.files.map((n) => (
          <a
            key={n}
            className="dlBtn"
            href={`/downloads/${encodeURIComponent(n)}`}
            target="_blank"
            rel="noopener"
          >
            📥 Скачать {n}
          </a>
        ))}

        {msg.who === "hermes" && parsed.clean && (
          <button
            className="playBtn"
            onClick={speak}
            disabled={busy}
            title="Озвучить"
          >
            {busy ? "…" : "🔊"}
          </button>
        )}
      </div>
    </div>
  );
}
