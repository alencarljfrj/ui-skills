import fs from "node:fs/promises";
import path from "node:path";

const REGISTRY_FILE = "/tmp/registry.json";
const ROOT_DIR = "/Users/mac/.gemini/antigravity/scratch/ui-skills";
const SKILLS_DIR = path.join(ROOT_DIR, "skills");
const TOPICS_DIR = path.join(ROOT_DIR, "skills-by-topic");

async function fetchWithRetry(url, maxRetries = 3, timeoutMs = 15000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "ui-skills-installer/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.text();
    } catch (err) {
      clearTimeout(timer);
      if (attempt === maxRetries) throw err;
      const delay = attempt * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function run() {
  console.log("Loading registry from", REGISTRY_FILE);
  const raw = await fs.readFile(REGISTRY_FILE, "utf-8");
  const data = JSON.parse(raw);
  const skills = data.registry || [];
  const topics = data.topics || [];

  console.log(`Found ${skills.length} skills and ${topics.length} topics in registry.`);

  await fs.mkdir(SKILLS_DIR, { recursive: true });
  await fs.mkdir(TOPICS_DIR, { recursive: true });

  // Prepare topic folders
  for (const topic of topics) {
    await fs.mkdir(path.join(TOPICS_DIR, topic.slug), { recursive: true });
  }

  let completed = 0;
  let successful = 0;
  let failed = [];

  // Limit concurrency
  const CONCURRENCY = 12;
  const queue = [...skills];

  async function worker(workerId) {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const user = item.user || "unknown";
      const slug = item.slug;
      const skillFolder = path.join(SKILLS_DIR, `${user}--${slug}`);
      const skillMdPath = path.join(skillFolder, "SKILL.md");

      try {
        await fs.mkdir(skillFolder, { recursive: true });

        // Download SKILL.md
        const skillContent = await fetchWithRetry(item.rawUrl);
        await fs.writeFile(skillMdPath, skillContent, "utf-8");

        // Download extra files if declared
        if (item.files && Array.isArray(item.files)) {
          const baseUrl = item.rawUrl.substring(0, item.rawUrl.lastIndexOf("/"));
          for (const relFile of item.files) {
            const fileUrl = `${baseUrl}/${relFile}`;
            const targetFilePath = path.join(skillFolder, relFile);
            await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
            try {
              const fileContent = await fetchWithRetry(fileUrl);
              await fs.writeFile(targetFilePath, fileContent, "utf-8");
            } catch (fileErr) {
              console.warn(`[WARN] Extra file failed: ${fileUrl} (${fileErr.message})`);
            }
          }
        }

        // Link/reference under topic folders
        if (item.topics && Array.isArray(item.topics)) {
          for (const topicSlug of item.topics) {
            const topicPath = path.join(TOPICS_DIR, topicSlug);
            const symlinkTarget = path.join(topicPath, `${user}--${slug}`);
            try {
              // Create relative symlink
              const rel = path.relative(topicPath, skillFolder);
              await fs.symlink(rel, symlinkTarget);
            } catch (symErr) {
              // Ignore if already exists
            }
          }
        }

        successful++;
      } catch (err) {
        failed.push({ skill: `${user}/${slug}`, error: err.message, url: item.rawUrl });
        console.error(`[FAIL] ${user}/${slug}: ${err.message}`);
      } finally {
        completed++;
        if (completed % 25 === 0 || completed === skills.length) {
          console.log(`Progress: ${completed}/${skills.length} (${successful} succeeded, ${failed.length} failed)`);
        }
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i));
  await Promise.all(workers);

  console.log("\nDownload Summary:");
  console.log(`Total: ${skills.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    await fs.writeFile(
      path.join(ROOT_DIR, "download_failures.json"),
      JSON.stringify(failed, null, 2),
      "utf-8"
    );
    console.log("Saved failure log to download_failures.json");
  }

  // Write catalog.json inside root
  await fs.writeFile(
    path.join(ROOT_DIR, "catalog.json"),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
  console.log("Written catalog.json successfully.");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
