#!/usr/bin/env node
/* Sync this project's built map into value-add-prototype's two embed folders.
 *
 * Why this exists: the slideshow (value-add-prototype) embeds a snapshot
 * of the map as an iframe. Updating the snapshot used to be a manual
 * build + copy across two folders. This script replaces that with one
 * command (pnpm sync) and preserves any per-embed customizations that
 * exist in the target folders but not in this project's build output.
 *
 * Assumes value-add-prototype lives at ../value-add-prototype relative
 * to this project. If you ever move either folder, update SLIDESHOW_ROOT.
 *
 * Per-embed customization rule: any file present in a target folder
 * but absent from this project's dist/ is treated as a hand-customized
 * embed override. The script saves it, wipes the target, copies the
 * fresh build, then restores the override. This means each embed
 * folder can carry its own tweaks (e.g. step-6 vs step-12 having
 * different mobile CSS) and the sync will not destroy them.
 *
 * Exception: files matching the Vite build artifact pattern
 * (assets/index-<hash>.{js,css}) are NOT preserved even if they look
 * like overrides. This guards against stale build artifacts from a
 * previous sync resurfacing (e.g. when value-add-prototype's git has
 * the old files tracked-as-deleted and someone undoes the deletion).
 * Real per-embed overrides should not match this pattern; name them
 * descriptively (embed-mobile-overrides.css, etc.).
 */

const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DIST = path.join(PROJECT_ROOT, "dist");
const SLIDESHOW_ROOT = path.resolve(
  PROJECT_ROOT,
  "..",
  "value-add-prototype",
);
// Stage 4 of the map-core extraction (see docs/plans/
// map-core-extraction-execution-plan.md) migrated step-12 to consume
// @moreharvest/map-core via an npm install + postinstall copy in
// value-add-prototype. `pnpm sync` therefore only targets the step-6
// embed; step-12 is fed from value-add-prototype's own node_modules.
// Stage 5 will retire this script entirely.
const TARGETS = [
  path.join(
    SLIDESHOW_ROOT,
    "public",
    "playground",
    "prototypes",
    "step-6-section-3-map",
    "map-prototype-v1",
  ),
];

// Vite emits hashed bundles at assets/index-<hash>.{js,css}. Anything matching
// this pattern that's NOT in the current dist/ is a stale artifact from an
// older build, not a per-embed override — do not preserve it.
const VITE_BUILD_ARTIFACT = /^assets[\/\\]index-[A-Za-z0-9_-]+\.(js|css)$/;

function listFilesRelative(root) {
  const out = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else out.push(path.relative(root, abs));
    }
  }
  walk(root);
  return out;
}

function fail(message) {
  console.error("\n❌  " + message);
  process.exit(1);
}

function main() {
  console.log("→ Syncing built map into value-add-prototype...\n");

  if (!fs.existsSync(DIST)) {
    fail(
      "No dist/ found. Run `pnpm build` first, or use `pnpm sync` (which builds first).",
    );
  }
  if (!fs.existsSync(SLIDESHOW_ROOT)) {
    fail(
      `Slideshow folder not found at ${SLIDESHOW_ROOT}. Expected value-add-prototype to be a sibling of this project.`,
    );
  }

  const distFiles = new Set(listFilesRelative(DIST));
  const summary = [];

  for (const target of TARGETS) {
    const label = path.relative(SLIDESHOW_ROOT, target);

    // 1. Identify per-embed overrides: files in target but not in dist,
    //    excluding stale Vite build artifacts (see VITE_BUILD_ARTIFACT above).
    const targetFiles = listFilesRelative(target);
    const preserved = targetFiles.filter(
      (f) => !distFiles.has(f) && !VITE_BUILD_ARTIFACT.test(f),
    );

    // 2. Read overrides into memory.
    const preservedContents = preserved.map((rel) => ({
      rel,
      buf: fs.readFileSync(path.join(target, rel)),
    }));

    // 3. Wipe target, recreate empty.
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(target, { recursive: true });

    // 4. Copy fresh dist/ in.
    fs.cpSync(DIST, target, { recursive: true });

    // 5. Restore overrides.
    for (const { rel, buf } of preservedContents) {
      const dest = path.join(target, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
    }

    summary.push({ label, preserved });
  }

  console.log("✓ Build copied into:");
  for (const { label, preserved } of summary) {
    console.log(`  • ${label}`);
    if (preserved.length === 0) {
      console.log("    (no per-embed overrides — pure build)");
    } else {
      console.log(
        `    Preserved ${preserved.length} per-embed override${preserved.length === 1 ? "" : "s"}:`,
      );
      for (const p of preserved) console.log(`      - ${p}`);
    }
  }

  console.log("\n→ Next steps:");
  console.log("  1. cd ../value-add-prototype");
  console.log("  2. Test slides 6, 7, 11, 12 in pnpm dev");
  console.log("  3. Tap Ozu-1 on slide 11/12 to verify the tour still launches");
  console.log("  4. Commit the updated map-prototype-v1/ folders");
  console.log("  5. Push (Vercel will auto-deploy)\n");
}

main();
