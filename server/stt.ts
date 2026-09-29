import { writeFileSync, unlinkSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

export interface SttResult {
  text: string;
  language?: string;
}

/**
 * Распознавание речи. По умолчанию вызываем внешний воркер
 * (например, ваш старый stt_worker.py на faster-whisper).
 * Замените STT_COMMAND на любой скрипт, который:
 *   <cmd> <audio_file> [--lang ru]  ->  печатает JSON {text, language}
 */
const STT_COMMAND = process.env.STT_COMMAND ?? "python3";
const STT_SCRIPT = process.env.STT_SCRIPT ?? path.resolve("stt_worker.py");

export async function speechToText(
  audioBuffer: Buffer,
  forcedLang?: string,
): Promise<SttResult> {
  const tmp = path.resolve(`data/stt-${Date.now()}.webm`);
  writeFileSync(tmp, audioBuffer);
  try {
    const args = [STT_SCRIPT, tmp];
    if (forcedLang) args.push("--lang", forcedLang);
    const { stdout } = await execFileAsync(STT_COMMAND, args, {
      timeout: 180_000,
    });
    return JSON.parse(stdout) as SttResult;
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}
