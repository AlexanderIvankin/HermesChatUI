import { useRef, useState } from "react";

interface Props {
  onSend: (text: string) => void;
  onUpload: (file: File) => void;
  onAudio: (b64: string) => void;
  recording: boolean;
  onToggleRec: () => void;
  placeholder: string;
  sendLabel: string;
}

export function Composer({
  onSend,
  onUpload,
  onAudio,
  recording,
  onToggleRec,
  placeholder,
  sendLabel,
}: Props) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function submit() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <footer className="footer">
      <button
        className={`recBtn ${recording ? "recording" : ""}`}
        onClick={onToggleRec}
        title="Голос"
      >
        🎤
      </button>

      <button
        className="fileBtn"
        onClick={() => fileRef.current?.click()}
        title="Файл"
      >
        📎
      </button>
      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onUpload(f);
        }}
      />

      <div className="input-wrap">
        <textarea
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
      </div>

      <button className="sendBtn" onClick={submit}>
        {sendLabel}
      </button>
    </footer>
  );
}
