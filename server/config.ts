import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

function readKeyFromHermesEnv(): string {
  const envFile = path.join(process.env.HERMES_HOME ?? path.join(os.homedir(), ".hermes"), ".env");
  if (!existsSync(envFile)) return "";
  const content = readFileSync(envFile, "utf8");
  for (const line of content.split("\n")) {
    if (line.startsWith("API_SERVER_KEY=")) {
      return line.slice("API_SERVER_KEY=".length).trim();
    }
  }
  return "";
}

export const config = {
  hermesHome: process.env.HERMES_HOME ?? path.join(os.homedir(), ".hermes"),
  hermesApiUrl: process.env.HERMES_API_URL ?? "http://127.0.0.1:8642",
  apiKey: process.env.API_SERVER_KEY || readKeyFromHermesEnv(),
  port: Number(process.env.PORT ?? 8000),
  host: process.env.HOST ?? "0.0.0.0",
  tlsCert: process.env.TLS_CERT ?? "./certs/cert.pem",
  tlsKey: process.env.TLS_KEY ?? "./certs/key.pem",
  dataDir: path.resolve("data")
};

export const paths = {
  uploads: path.join(config.dataDir, "uploads"),
  downloads: path.join(config.dataDir, "downloads"),
  images: path.join(config.dataDir, "images"),
  sessions: path.join(config.dataDir, "sessions.json")
};