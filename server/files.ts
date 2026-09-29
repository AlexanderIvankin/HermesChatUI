import { mkdirSync, readdirSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { paths } from "./config.js";

export function ensureDataDirs(): void {
  for (const dir of [paths.uploads, paths.downloads, paths.images]) {
    mkdirSync(dir, { recursive: true });
  }
}

export function listFiles(dir: string): { name: string; size: number }[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => {
      try {
        return readdirSync(dir).includes(f);
      } catch {
        return false;
      }
    })
    .map((f) => {
      const full = path.join(dir, f);
      try {
        const stat = readFileSync(full);
        return { name: f, size: stat.length };
      } catch {
        return { name: f, size: 0 };
      }
    });
}

export function guessMime(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".mp4": "video/mp4",
    ".zip": "application/zip",
    ".csv": "text/csv; charset=utf-8",
    ".xml": "text/xml; charset=utf-8",
  };
  return map[ext] ?? "application/octet-stream";
}

/** Безопасное имя (без обхода пути). */
export function safeName(name: string): string {
  return path.basename(name.replace(/\\/g, "/"));
}

const TEXT_EXTS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".json",
  ".py",
  ".js",
  ".ts",
  ".html",
  ".htm",
  ".css",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".cfg",
  ".conf",
  ".log",
  ".csv",
  ".tsv",
  ".sh",
  ".bash",
  ".c",
  ".cpp",
  ".h",
  ".java",
  ".go",
  ".rs",
  ".sql",
  ".rb",
  ".php",
  ".lua",
  ".pl",
  ".ps1",
  ".bat",
  ".env",
]);

/** Попробовать прочитать файл как UTF-8 текст. */
export function tryReadText(
  filePath: string,
  name: string,
): { text: string | null; note: string } {
  const ext = path.extname(name).toLowerCase();
  if (!TEXT_EXTS.has(ext)) return { text: null, note: "" };
  try {
    const buf = readFileSync(filePath);
    const text = buf.toString("utf8");
    if (!text.trim()) return { text: "", note: " (empty)" };
    if (text.length > 1_000_000)
      return { text: text.slice(0, 1_000_000), note: " (read first 1MB)" };
    return { text, note: ` (read ${text.length} chars)` };
  } catch {
    return { text: null, note: "" };
  }
}
