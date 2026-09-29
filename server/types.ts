export type Role = "user" | "hermes";

export interface ChatMessage {
  who: Role;
  text: string;
  ts?: string;
}

export interface ChatSession {
  id: string;
  gateway_id: string | null;
  title: string;
  created: string;
  messages: ChatMessage[];
}

export interface SessionStore {
  sessions: ChatSession[];
  active: string | null;
}

export interface UploadedFile {
  name: string;
  size: number;
}