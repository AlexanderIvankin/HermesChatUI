import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { config, paths } from "./config.js";
import {
  ensureDataDirs,
  listFiles,
  guessMime,
  safeName,
  tryReadText,
} from "./files.js";
import * as sessions from "./sessions.js";
import * as hermes from "./hermes.js";
import { textToSpeech } from "./tts.js";
import { speechToText } from "./stt.js";

// --- DEV STUB: чтобы UI работал без Hermes ---
const DEV_STUB = process.env.DEV_STUB === "true";

ensureDataDirs();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// --- static ---
app.use("/uploads", express.static(paths.uploads));
app.use("/downloads", express.static(paths.downloads));
app.use("/images", express.static(paths.images));
app.use(express.static(path.resolve("dist/client")));

// --- uploads ---
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no file" });
    const name = safeName(req.file.originalname);
    const dest = path.join(paths.uploads, name);
    writeFileSync(dest, req.file.buffer);

    const { text, note } = tryReadText(dest, name);
    if (text !== null) {
      try {
        const s = sessions.activeSession();
        const gatewayId = await hermes.ensureHermesSession(s.gateway_id);
        sessions.setGatewayId(s.id, gatewayId);
        await hermes.askHermes(
          gatewayId,
          `[User uploaded file "${name}". Contents:\n${text}]`,
        );
      } catch (e) {
        return res.json({
          ok: true,
          name,
          text_read: true,
          note: `${note} (push failed: ${(e as Error).message})`,
        });
      }
      return res.json({ ok: true, name, text_read: true, note });
    }
    res.json({
      ok: true,
      name,
      text_read: false,
      note: " (stored; not a text file)",
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// --- uploads list ---
app.get("/api/uploads", (_req, res) =>
  res.json({ files: listFiles(paths.uploads) }),
);
app.get("/api/downloads", (_req, res) =>
  res.json({ files: listFiles(paths.downloads) }),
);

// --- chat ---
app.post("/api/chat", async (req, res) => {
  try {
    const text = String(req.body?.message ?? "");
    const s = sessions.activeSession();

    if (DEV_STUB) {
      const reply = `[эхо] Ты сказал: "${text}". Hermes сейчас недоступен, но UI работает!`;
      sessions.appendMessage(s.id, { who: "user", text });
      sessions.appendMessage(s.id, { who: "hermes", text: reply });
      return res.json({ reply, images: [] });
    }
    
    const gatewayId = await hermes.ensureHermesSession(s.gateway_id);
    sessions.setGatewayId(s.id, gatewayId);
    let reply = await hermes.askHermes(gatewayId, text);

    // [Image: ...] -> generate via Pollinations
    const images: string[] = [];
    if (reply.includes("[Image:")) {
      const matches = [...reply.matchAll(/\[Image:\s*([^\]]+)\]/g)];
      for (const m of matches) {
        const prompt = m[1].trim();
        try {
          const name = await generateImage(prompt);
          images.push(name);
          reply = reply.replace(m[0], `[ImageSaved:${name}]`);
        } catch {
          reply = reply.replace(m[0], "");
        }
      }
    }

    sessions.appendMessage(s.id, { who: "user", text });
    sessions.appendMessage(s.id, { who: "hermes", text: reply });
    res.json({ reply, images });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// --- history ---
app.get("/api/history", (_req, res) => {
  res.json({ messages: sessions.activeSession().messages });
});

// --- sessions CRUD ---
app.get("/api/sessions", (_req, res) =>
  res.json({ sessions: sessions.listSessions() }),
);
app.post("/api/sessions", (req, res) => {
  const s = sessions.createSession(req.body?.title ?? "Новый чат");
  res.json({ session: s });
});
app.delete("/api/sessions/:id", (req, res) => {
  sessions.deleteSession(req.params.id);
  res.json({ ok: true });
});

// --- TTS ---
app.post("/api/tts", async (req, res) => {
  try {
    const audio = await textToSpeech(String(req.body?.text ?? ""));
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audio);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// --- STT ---
app.post("/api/stt", async (req, res) => {
  try {
    const b64 = String(req.body?.audio_b64 ?? "");
    if (!b64) return res.status(400).json({ error: "no audio" });
    const buf = Buffer.from(b64, "base64");
    const result = await speechToText(buf, req.body?.lang);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// --- image generation (Pollinations) ---
async function generateImage(prompt: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  const name = `img_${Date.now()}_${createHash("md5").update(prompt).digest("hex").slice(0, 6)}.jpg`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`Pollinations ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(path.join(paths.images, name), buf);
  return name;
}

// --- start ---
app.listen(config.port, config.host, () => {
  console.log(`🌐 Hermes Web App: https://${config.host}:${config.port}`);
  console.log(`   (TLS certificates expected at ${config.tlsCert})`);
});

// --- HTTPS (микрофон в браузере требует secure context) ---
// Раскомментируйте, когда будут сертификаты:
// import https from "node:https";
// if (existsSync(config.tlsCert) && existsSync(config.tlsKey)) {
//   https.createServer({
//     cert: readFileSync(config.tlsCert),
//     key: readFileSync(config.tlsKey)
//   }, app).listen(config.port, config.host);
// }
