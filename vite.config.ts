import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Nitro picks the deploy target automatically (Vercel, Netlify, ...) and falls
// back to a plain Node server. Force one with e.g. NITRO_PRESET=node-server.
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      // Our SSR error wrapper lives in src/server.ts
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    nitro(),
  ],
});
