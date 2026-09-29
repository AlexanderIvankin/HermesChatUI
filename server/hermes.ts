import { config } from "./config.js";

export async function hermesRequest<T = any>(
  method: string,
  apiPath: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${config.hermesApiUrl}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Hermes API ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

const SYSTEM_CONTEXT = `You are Hermes, a friendly AI assistant acting as the user's friend and mentor.
The user is located in Russia: OpenAI and ElevenLabs are blocked there, so everything
runs on free/unblocked tech. Reply in the same language the user writes in.
Reply warmly, as a supportive friend and mentor.
- FILE DELIVERY: to give the user a file, save it into ${process.env.PWD ?? "."}/data/downloads/
  and write a line exactly: [Download: filename.ext]
- IMAGE GENERATION: to create a picture, write: [Image: detailed English description]`;

/** Создать (или переиспользовать) gateway-сессию Hermes. */
export async function ensureHermesSession(
  existingId: string | null,
): Promise<string> {
  if (existingId) {
    try {
      const info = await hermesRequest<{
        session: { ended_at?: string | null };
      }>("GET", `/api/sessions/${existingId}`);
      if (info.session?.ended_at == null) return existingId;
    } catch {
      /* сессия пропала — создадим новую */
    }
  }
  const created = await hermesRequest<{ session: { id: string } }>(
    "POST",
    "/api/sessions",
    { system_prompt: SYSTEM_CONTEXT },
  );
  return created.session.id;
}

/** Отправить одно сообщение и вернуть текст ответа Hermes. */
export async function askHermes(
  gatewayId: string,
  message: string,
): Promise<string> {
  const result = await hermesRequest<{ message?: { content?: string } }>(
    "POST",
    `/api/sessions/${gatewayId}/chat`,
    { message },
  );
  return result.message?.content ?? "";
}
