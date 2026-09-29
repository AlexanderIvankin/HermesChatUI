import { EdgeTTS } from "node-edge-tts";

const VOICE_EN = "en-US-ChristopherNeural";
const VOICE_RU = "ru-RU-DmitryNeural";

export function detectLang(text: string): "ru" | "en" {
  const cyr = (text.match(/[а-яА-ЯёЁ]/g) || []).length;
  const lat = (text.match(/[a-zA-Z]/g) || []).length;
  return cyr > lat ? "ru" : "en";
}

export async function textToSpeech(text: string): Promise<Buffer> {
  const voice = detectLang(text) === "ru" ? VOICE_RU : VOICE_EN;
  const tts = new EdgeTTS({
    voice,
    lang: voice.split("-").slice(0, 2).join("-"),
  });
  const tmp = `data/tts-${Date.now()}.mp3`;
  await tts.ttsPromise(text, tmp);
  const { readFileSync, unlinkSync } = await import("node:fs");
  const buf = readFileSync(tmp);
  try {
    unlinkSync(tmp);
  } catch {
    /* ignore */
  }
  return buf;
}
