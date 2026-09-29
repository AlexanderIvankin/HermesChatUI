export type Role = "user" | "hermes";

export interface ChatMessage {
  who: Role;
  text: string;
  ts?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created: string;
  messages: ChatMessage[];
}

export type Theme = "dark" | "light";
export type Lang = "ru" | "en";
