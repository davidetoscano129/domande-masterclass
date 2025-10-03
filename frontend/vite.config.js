import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: false, // Manteniamo HTTP per ora
    host: true, // Permette accesso da rete esterna
    port: 5173,
    strictPort: true, // Non cambia porta automaticamente
  },
});
