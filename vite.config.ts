import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const backend = "http://localhost:8000";
const proxyOpts = { target: backend, changeOrigin: true };

// Прокси /api/*, но НЕ /api.ts (это клиентский исходник)
const apiBypass = (req: { url?: string }) => {
  const url = req.url ?? "";
  if (url.endsWith(".ts") || url === "/api" || url === "/api.ts") {
    return url; // отдаём Vite'у, не проксируем
  }
  return undefined; // проксируем
};

export default defineConfig({
  root: path.resolve("client"),
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { ...proxyOpts, bypass: apiBypass },
      "/uploads": proxyOpts,
      "/downloads": proxyOpts,
      "/images": proxyOpts,
    },
  },
  build: {
    outDir: path.resolve("dist/client"),
    emptyOutDir: true,
  },
});
