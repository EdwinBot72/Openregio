import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const nm = (pkg: string) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`);
          if (nm("react") || nm("react-dom") || nm("scheduler")) {
            return "react-vendor";
          }
          if (nm("recharts") || nm("d3-array") || nm("d3-scale") || nm("d3-shape") || nm("d3-color") || nm("d3-format") || nm("d3-interpolate") || nm("d3-time") || nm("d3-path") || nm("victory-vendor")) {
            return "charts";
          }
          if (nm("framer-motion")) {
            return "motion";
          }
          if (nm("leaflet") || nm("react-leaflet") || nm("@react-leaflet")) {
            return "maps";
          }
          if (nm("@radix-ui") || id.includes("/node_modules/@radix-ui/") || nm("lucide-react") || nm("class-variance-authority") || nm("clsx") || nm("tailwind-merge") || nm("cmdk") || nm("vaul") || nm("embla-carousel-react")) {
            return "ui-vendor";
          }
          if (nm("@tanstack") || nm("react-hook-form") || nm("@hookform") || nm("zod") || nm("zod-validation-error")) {
            return "data-layer";
          }
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
