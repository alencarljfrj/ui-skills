import fs from "node:fs/promises";
import path from "node:path";

const GLOBAL_AGENTS_DIR = "/Users/mac/.agents/skills";
const REPO_SKILLS_DIR = "/Users/mac/.gemini/antigravity/scratch/ui-skills/skills";

async function run() {
  console.log(`Synchronizing skills to global agents directory: ${GLOBAL_AGENTS_DIR}`);
  await fs.mkdir(GLOBAL_AGENTS_DIR, { recursive: true });

  const entries = await fs.readdir(REPO_SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  console.log(`Found ${skillDirs.length} skills in repository.`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const dirName of skillDirs) {
    const srcPath = path.join(REPO_SKILLS_DIR, dirName);
    // Determine friendly name: e.g. "ibelick--baseline-ui" -> also alias "baseline-ui" if unique
    const parts = dirName.split("--");
    const slug = parts.length > 1 ? parts.slice(1).join("--") : dirName;

    // 1. Create canonical symlink with full author--slug
    const destCanonical = path.join(GLOBAL_AGENTS_DIR, dirName);
    try {
      await fs.symlink(srcPath, destCanonical);
      createdCount++;
    } catch (e) {
      if (e.code === "EEXIST") {
        skippedCount++;
      }
    }

    // 2. Also create friendly short slug if not colliding
    const destShort = path.join(GLOBAL_AGENTS_DIR, slug);
    try {
      await fs.symlink(srcPath, destShort);
    } catch (e) {
      // Ignore collision with existing
    }
  }

  console.log(`Global sync complete: ${createdCount} new links created (${skippedCount} already existed).`);
  console.log(`All UI skills are now instantly available to Antigravity, Gemini, and local coding agents!`);
}

run().catch(console.error);
