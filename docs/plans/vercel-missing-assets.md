# Vercel deployment: missing assets

## Problem

Icons, images, and PDFs do not render on the Vercel production deployment. Everything works fine during local development.

## Root cause

Before commit `46ecd83` ("fix: vercel issue"), the project had no build step. Vercel served the repository files directly, so the root `assets/` folder was accessible at runtime. All image, SVG, and PDF references like `assets/tsmc-logo.svg` resolved correctly because the file existed at that path relative to `index.html`.

That commit introduced Vite as a build tool and configured Vercel to serve from `dist/` instead of the repo root:

- Added `vite.config.js` with `publicDir: "public"` and `outDir: "dist"`.
- Added `vercel.json` with `outputDirectory: "dist"`.

Vite's build process only copies two things into `dist/`:
1. Bundled JS and CSS (hashed files in `dist/assets/`).
2. Static files from the `public/` directory.

The root `assets/` folder (containing all images, SVGs, PDFs, and some JSON files) is not inside `public/`, so Vite never copies it to `dist/`. The result is that `dist/assets/` only contains the bundled JS/CSS and the two JSON files that were already in `public/assets/map-outlines/`.

## Why local dev still works

Vite's dev server serves both the project root and the `public/` directory. A request for `assets/tsmc-logo.svg` finds the file in the root `assets/` folder during development. The problem only surfaces in production where only `dist/` is served.

## Fix

Move all contents of the root `assets/` folder into `public/assets/`. Vite will then copy them into `dist/assets/` during build, and the existing relative paths in JS code (`assets/foo.svg`) will resolve correctly.

After moving, the root `assets/` folder can be deleted since `public/assets/` becomes the single source of truth.

### Steps

1. Copy everything from `assets/` into `public/assets/` (the `map-outlines/` subfolder already exists there, so merge carefully).
2. Delete the root `assets/` directory.
3. Update any references if needed (none expected, since the served path stays the same).
4. Run `pnpm build` and verify `dist/assets/` contains all images, SVGs, and PDFs.
5. Commit and push. Vercel will rebuild and assets will render.

## Files affected

| Root assets/ contents | Count |
|---|---|
| SVG logos | 14 |
| WebP images | 2 |
| `pdfs/` | 3 PDF files |
| `step-11-images/` | 29 WebP files |
| `use-case-images/` | 38 WebP files |
| `map-outlines/` | 1 KML file (JSON files already in public/) |
