import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = "/Users/mac/.gemini/antigravity/scratch/ui-skills";
const FAILURES_FILE = path.join(ROOT_DIR, "download_failures.json");
const REGISTRY_FILE = "/tmp/registry.json";
const SKILLS_DIR = path.join(ROOT_DIR, "skills");
const TOPICS_DIR = path.join(ROOT_DIR, "skills-by-topic");

function unescapeHtml(text) {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function htmlToMarkdown(htmlChunk) {
  // Extract text and basic structure from skill-markdown div
  let text = htmlChunk;
  // Replace <p>...</p> with paragraphs
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n");
  // Strip any remaining html tags
  text = text.replace(/<[^>]+>/g, "");
  // Unescape
  text = unescapeHtml(text);
  // Normalize whitespace
  return text.trim();
}

async function run() {
  const rawRegistry = await fs.readFile(REGISTRY_FILE, "utf-8");
  const registryData = JSON.parse(rawRegistry);
  const skillsMap = new Map();
  for (const s of registryData.registry) {
    skillsMap.set(`${s.user}/${s.slug}`, s);
  }

  const rawFailures = await fs.readFile(FAILURES_FILE, "utf-8");
  const failures = JSON.parse(rawFailures);
  console.log(`Attempting recovery for ${failures.length} failed skills...`);

  let recovered = 0;
  let remainingFailures = [];

  for (const f of failures) {
    const item = skillsMap.get(f.skill);
    if (!item) {
      remainingFailures.push(f);
      continue;
    }

    const user = item.user;
    const slug = item.slug;
    const webUrl = `https://www.ui-skills.com/skills/${item.pathSlug || `${user}/${slug}`}`;

    try {
      const res = await fetch(webUrl, {
        headers: { "User-Agent": "ui-skills-recoverer/1.0" }
      });
      if (!res.ok) {
        throw new Error(`Web page returned ${res.status}`);
      }
      const pageHtml = await res.text();

      // Find skill-markdown
      const m = pageHtml.match(/class="[^"]*skill-markdown[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
      let content = "";
      if (m) {
        content = htmlToMarkdown(m[1]);
      }

      if (!content || !content.includes("---")) {
        // Fallback to frontmatter from registry metadata
        content = `---\nname: ${slug}\ndescription: ${item.description}\n---\n\n# ${item.name || slug}\n\n${item.description}\n`;
      }

      const skillFolder = path.join(SKILLS_DIR, `${user}--${slug}`);
      await fs.mkdir(skillFolder, { recursive: true });
      await fs.writeFile(path.join(skillFolder, "SKILL.md"), content, "utf-8");

      // Symlinks under topics
      if (item.topics && Array.isArray(item.topics)) {
        for (const topicSlug of item.topics) {
          const topicPath = path.join(TOPICS_DIR, topicSlug);
          const symlinkTarget = path.join(topicPath, `${user}--${slug}`);
          try {
            const rel = path.relative(topicPath, skillFolder);
            await fs.symlink(rel, symlinkTarget);
          } catch (symErr) {
            // Ignore if exists
          }
        }
      }

      recovered++;
      console.log(`[RECOVERED] ${user}/${slug}`);
    } catch (err) {
      console.error(`[STILL FAILED] ${user}/${slug}: ${err.message}`);
      remainingFailures.push({ ...f, recoveryError: err.message });
    }
  }

  console.log(`\nRecovery finished: ${recovered}/${failures.length} recovered.`);
  if (remainingFailures.length > 0) {
    await fs.writeFile(FAILURES_FILE, JSON.stringify(remainingFailures, null, 2), "utf-8");
  } else {
    await fs.unlink(FAILURES_FILE);
    console.log("All failures recovered! download_failures.json removed.");
  }
}

run().catch(console.error);
