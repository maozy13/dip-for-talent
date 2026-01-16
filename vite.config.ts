import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const packageName = "dip-for-talent";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        format: "umd",
        name: packageName
      }
    }
  },
  server: {
    port: 8081,
    cors: true,
    proxy: {
      "/api": {
        target: "https://dip.aishu.cn/",
        changeOrigin: true
      }
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization"
    }
  }
});
