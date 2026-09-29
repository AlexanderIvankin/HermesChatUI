import { readFileSync, writeFileSync, existsSync } from "node:fs";
import type { ChatMessage, ChatSession, SessionStore } from "./types.js";
import { paths } from "./config.js";

let cache: SessionStore | null = null;

function defaultStore(): SessionStore {
  return { sessions: [], active: null };
}

function load(): SessionStore {
  if (cache) return cache;
  if (existsSync(paths.sessions)) {
    try {
      cache = JSON.parse(readFileSync(paths.sessions, "utf8")) as SessionStore;
    } catch {
      cache = defaultStore();
    }
  } else {
    cache = defaultStore();
  }
  return cache;
}

function save(): void {
  if (!cache) return;
  writeFileSync(paths.sessions, JSON.stringify(cache, null, 2), "utf8");
}

export function newId(): string {
  return "s" + Date.now().toString();
}

export function nowIso(): string {
  return new Date().toISOString().slice(0, 19);
}

export function listSessions(): ChatSession[] {
  return load().sessions;
}

export function findSession(id: string): ChatSession | undefined {
  return load().sessions.find((s) => s.id === id);
}

export function activeSession(): ChatSession {
  const store = load();
  let s = store.active ? findSession(store.active) : undefined;
  if (!s) {
    if (store.sessions.length > 0) {
      s = store.sessions[0];
      store.active = s.id;
      save();
    } else {
      s = createSession("Чат");
    }
  }
  return s;
}

export function createSession(title = "Новый чат"): ChatSession {
  const store = load();
  const s: ChatSession = {
    id: newId(),
    gateway_id: null,
    title: title.slice(0, 60),
    created: nowIso(),
    messages: [],
  };
  store.sessions.push(s);
  store.active = s.id;
  save();
  return s;
}

export function deleteSession(id: string): void {
  const store = load();
  store.sessions = store.sessions.filter((s) => s.id !== id);
  if (store.active === id) {
    store.active = store.sessions[0]?.id ?? null;
  }
  save();
  if (!store.active) createSession("Новый чат");
}

export function setGatewayId(sessionId: string, gatewayId: string): void {
  const s = findSession(sessionId);
  if (s) {
    s.gateway_id = gatewayId;
    save();
  }
}

export function appendMessage(sessionId: string, msg: ChatMessage): void {
  const s = findSession(sessionId);
  if (!s) return;
  s.messages.push({ ...msg, ts: msg.ts ?? nowIso() });
  // авто-название сессии по первому сообщению пользователя
  if (s.title === "Новый чат" && msg.who === "user") {
    s.title = (msg.text || "Чат").slice(0, 60);
  }
  save();
}
