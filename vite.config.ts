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
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const nm = (pkg: string) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`);
          if (nm("react") || nm("react-dom") || nm("scheduler")) {
            return "react-vendor";
          }
          if (nm("leaflet") || nm("react-leaflet") || nm("@react-leaflet")) {
            return "maps";
          }
          if (nm("@radix-ui") || nm("lucide-react") || nm("class-variance-authority") || nm("clsx") || nm("tailwind-merge") || nm("cmdk") || nm("vaul") || nm("embla-carousel-react")) {
            return "ui-vendor";
          }
          if (nm("@tanstack") || nm("react-hook-form") || nm("@hookform") || nm("zod") || nm("zod-validation-error")) {
            return "data-layer";
          }
          return "vendor-misc";
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
