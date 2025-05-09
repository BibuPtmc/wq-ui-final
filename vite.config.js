import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
      // Ajout de la configuration HMR
      protocol: "ws",
      host: "localhost",
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
});
