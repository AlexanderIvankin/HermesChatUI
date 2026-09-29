import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { Message } from "./Message";

interface Props {
  messages: ChatMessage[];
  thinking: boolean;
  thinkingText: string;
  onPlay: (audio: HTMLAudioElement) => void;
}

export function ChatView({ messages, thinking, thinkingText, onPlay }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  return (
    <div id="chat" ref={ref}>
      {messages.map((m, i) => (
        <Message key={i} msg={m} onPlay={onPlay} />
      ))}
      {thinking && <div className="msg hermes typing">{thinkingText}</div>}
    </div>
  );
}
