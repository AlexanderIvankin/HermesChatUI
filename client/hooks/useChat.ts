import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { ChatMessage } from "../types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .history()
      .then((d) => setMessages(d.messages))
      .catch((e) => setError(e.message));
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { who: "user", text }]);
    setThinking(true);
    setError(null);
    try {
      const { reply } = await api.chat(text);
      setMessages((m) => [...m, { who: "hermes", text: reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  }, []);

  return { messages, thinking, error, send };
}
