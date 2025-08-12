import { defineConfig } from "vite"
import plugin from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [plugin()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    strictPort: true,
    open: true,
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          utils: ["axios", "lucide-react"],
        },
      },
    },
  },
})
