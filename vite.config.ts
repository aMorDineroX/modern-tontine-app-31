import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Fallback values for critical environment variables
  const supabaseUrl = env.VITE_SUPABASE_URL || 'https://qgpqiehjmkfxfnfrowbc.supabase.co';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncHFpZWhqbWtmeGZuZnJvd2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDkzNzUsImV4cCI6MjA1NjI4NTM3NX0.pYcG26WQa-6rIfDcE5mDjNhGbhYAlTMOvCxfYtNmu-0';

  console.log('Vite config - SUPABASE_URL:', supabaseUrl);
  console.log('Vite config - SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 10) + '...');

  return {
    server: {
      host: "::",
      port: 8080,
    },
    base: '/',
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
    define: {
      // Expose environment variables to the application
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
  };
});