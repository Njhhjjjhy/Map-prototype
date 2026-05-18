import { defineConfig } from "vite";

// Strip dev-only HTML blocks from production builds.
// Wrap any block in index.html that should be local-only with the markers:
//   <!-- DEV-ONLY-START -->
//   ...elements...
//   <!-- DEV-ONLY-END -->
// In `pnpm dev` (development mode) the block stays.
// In `pnpm build` / Vercel (production mode) the block is removed before the
// HTML ships, so the live site never contains the markup.
const stripDevOnly = () => ({
  name: "strip-dev-only",
  transformIndexHtml: {
    order: "pre",
    handler(html, { server }) {
      // `server` is defined only in dev mode; on build it is undefined.
      if (server) return html;
      return html.replace(
        /<!--\s*DEV-ONLY-START\s*-->[\s\S]*?<!--\s*DEV-ONLY-END\s*-->/g,
        "",
      );
    },
  },
});

export default defineConfig({
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    copyPublicDir: true,
  },
  plugins: [stripDevOnly()],
});
