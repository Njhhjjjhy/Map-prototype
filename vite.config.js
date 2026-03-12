import { defineConfig } from "vite";


export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    copyPublicDir: true,
  },
});
