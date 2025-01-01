import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Content-Security-Policy": [
        "default-src 'self'",
        "img-src 'self' data: blob: https://kthqkydgegsoheymesgc.supabase.co https://receipt-o-meter.lovable.app",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kthqkydgegsoheymesgc.supabase.co",
        "connect-src 'self' https://kthqkydgegsoheymesgc.supabase.co wss://kthqkydgegsoheymesgc.supabase.co https://prices.shufersal.co.il",
        "frame-src 'self' https://kthqkydgegsoheymesgc.supabase.co",
        "font-src 'self' data: https://fonts.gstatic.com",
      ].join("; "),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
    },
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