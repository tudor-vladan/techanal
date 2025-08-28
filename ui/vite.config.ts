import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Parse CLI arguments for dynamic configuration
const parseCliArgs = () => {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('--port');
  const apiUrlIndex = args.indexOf('--api-url');
  const firebaseAuthPortIndex = args.indexOf('--firebase-auth-port');
  const useFirebaseEmulatorIndex = args.indexOf('--use-firebase-emulator');
  // Allow overriding via environment variable inside Docker containers
  const envApiUrl = process.env.VITE_API_URL;
  const envFirebaseAuthPort = process.env.VITE_FIREBASE_AUTH_EMULATOR_PORT;
  const envUseFirebaseEmulator = process.env.VITE_USE_FIREBASE_EMULATOR;
  
  return {
    port: portIndex !== -1 ? parseInt(args[portIndex + 1]) : 5173,
    apiUrl: apiUrlIndex !== -1 ? args[apiUrlIndex + 1] : (envApiUrl || 'http://localhost:5500'),
    firebaseAuthPort: firebaseAuthPortIndex !== -1 ? args[firebaseAuthPortIndex + 1] : (envFirebaseAuthPort || '5503'),
    useFirebaseEmulator: useFirebaseEmulatorIndex !== -1 ? args[useFirebaseEmulatorIndex + 1] : (envUseFirebaseEmulator || 'false')
  };
};

const { port, apiUrl, firebaseAuthPort, useFirebaseEmulator } = parseCliArgs();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: port,
    host: '0.0.0.0',
    // Proxy API requests during local development so visiting
    // http://localhost:<ui-port>/api/... hits the backend server
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        // keep the /api prefix as-is; backend expects it
        // no path rewrite needed
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': `"${apiUrl}"`,
    'import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT': `"${firebaseAuthPort}"`,
    'import.meta.env.VITE_USE_FIREBASE_EMULATOR': `"${useFirebaseEmulator}"`
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
