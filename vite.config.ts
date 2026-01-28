import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]]
      }
    })
  ],
  resolve: {
    alias: {
      "@app": path.join(srcPath, "app"),
      "@entities": path.join(srcPath, "entities"),
      "@features": path.join(srcPath, "features"),
      "@shared": path.join(srcPath, "shared"),
      "@pages": path.join(srcPath, "pages"),
      "@widgets": path.join(srcPath, "widgets")
    }
  }
});
