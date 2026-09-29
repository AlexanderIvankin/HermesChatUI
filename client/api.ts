import type { ChatMessage, ChatSession } from "./types";

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  history: () => fetch("/api/history").then(j<{ messages: ChatMessage[] }>),

  chat: (message: string) =>
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }).then(j<{ reply: string; images: string[] }>),

  tts: async (text: string) => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("tts failed");
    return res.blob();
  },

  stt: (audio_b64: string, lang: string | null = null) =>
    fetch("/api/stt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_b64, lang }),
    }).then(j<{ text: string; language?: string }>),

  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch("/api/upload", { method: "POST", body: fd }).then(
      j<{ ok: boolean; name: string; text_read: boolean; note: string }>,
    );
  },

  listSessions: () =>
    fetch("/api/sessions").then(j<{ sessions: ChatSession[] }>),
  createSession: (title?: string) =>
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(j<{ session: ChatSession }>),
  deleteSession: (id: string) =>
    fetch(`/api/sessions/${id}`, { method: "DELETE" }).then(j<{ ok: boolean }>),
};
