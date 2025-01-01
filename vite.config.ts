import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Listen on all available network interfaces
    port: 8080,
    headers: {
      "Content-Security-Policy": [
        "default-src 'self'",
        "img-src 'self' data: blob: https:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: https://*.lovable.app https://*.gptengineer.app",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://prices.shufersal.co.il ws: wss: http: https: https://*.lovable.app https://*.gptengineer.app",
        "frame-src 'self' https://*.supabase.co https://*.lovable.app https://*.gptengineer.app",
        "font-src 'self' data: https://fonts.gstatic.com",
      ].join("; "),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
    },
    cors: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
}));