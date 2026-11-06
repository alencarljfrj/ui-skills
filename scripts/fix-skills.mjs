/**
 * fix-skills.mjs
 * Repara o frontmatter YAML de todas as 56 skills corrompidas ou sem frontmatter.
 */
import fs from "fs";
import path from "path";

const ROOT_DIR = "/Users/mac/.gemini/antigravity/scratch/ui-skills";
const SKILLS_DIR = path.join(ROOT_DIR, "skills");
const CATALOG_PATH = path.join(ROOT_DIR, "catalog.json");

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const registry = catalog.registry;

const brokenList = [
  "Leonxlnx--brandkit",
  "Leonxlnx--brutalist-skill",
  "Leonxlnx--gpt-tasteskill",
  "Leonxlnx--image-to-code-skill",
  "Leonxlnx--imagegen-frontend-mobile",
  "Leonxlnx--imagegen-frontend-web",
  "Leonxlnx--minimalist-skill",
  "Leonxlnx--output-skill",
  "Leonxlnx--redesign-skill",
  "Leonxlnx--soft-skill",
  "Leonxlnx--stitch-skill",
  "Leonxlnx--taste-skill-v1",
  "danny--explore-design",
  "danny--motion-ad",
  "danny--screenshot",
  "heygen-com--embedded-captions",
  "heygen-com--faceless-explainer",
  "heygen-com--general-video",
  "heygen-com--hyperframes-animation",
  "heygen-com--hyperframes-audio",
  "heygen-com--hyperframes-core",
  "heygen-com--hyperframes-creative",
  "heygen-com--hyperframes-keyframes",
  "heygen-com--hyperframes-studio",
  "heygen-com--motion-graphics",
  "heygen-com--music-to-video",
  "heygen-com--pr-to-video",
  "heygen-com--product-launch-video",
  "heygen-com--talking-head-recut",
  "jakubkrehel--technical-drawing",
  "mattpocock--engineering",
  "pbakaus--adapt",
  "pbakaus--animate",
  "pbakaus--audit",
  "pbakaus--bolder",
  "pbakaus--clarify",
  "pbakaus--colorize",
  "pbakaus--critique",
  "pbakaus--delight",
  "pbakaus--distill",
  "pbakaus--harden",
  "pbakaus--layout",
  "pbakaus--optimize",
  "pbakaus--overdrive",
  "pbakaus--polish",
  "pbakaus--quieter",
  "pbakaus--shape",
  "pbakaus--typeset",
  "rams-design--rams",
  "raphaelsalaja--12-principles-of-animation",
  "raphaelsalaja--generating-sounds-with-ai",
  "raphaelsalaja--mastering-animate-presence",
  "raphaelsalaja--morphing-icons",
  "raphaelsalaja--pseudo-elements",
  "raphaelsalaja--sounds-on-the-web",
  "raphaelsalaja--to-spring-or-not-to-spring"
];

function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-");
}

let fixed = 0;

for (const dir of brokenList) {
  const filePath = path.join(SKILLS_DIR, dir, "SKILL.md");
  if (!fs.existsSync(filePath)) {
    console.warn(`[SKIP] Arquivo não encontrado: ${filePath}`);
    continue;
  }

  const parts = dir.split("--");
  const user = parts[0];
  const slug = parts.slice(1).join("--");

  // Localizar no catalog
  let match = registry.find((s) => {
    const sUser = (s.user || "").toLowerCase();
    const sSlug = (s.slug || s.name || "").toLowerCase();
    return (
      (sUser === user.toLowerCase() && sSlug === slug.toLowerCase()) ||
      s.pathSlug?.toLowerCase() === `${user}/${slug}`.toLowerCase()
    );
  });

  if (!match) {
    match = registry.find(
      (s) => (s.slug || s.name || "").toLowerCase() === slug.toLowerCase()
    );
  }

  if (!match) {
    console.error(`[ERROR] Sem metadados para ${dir}`);
    continue;
  }

  const skillName = sanitizeName(match.name || match.slug || slug);
  const skillDesc = match.description || `${skillName} skill`;
  const originalText = fs.readFileSync(filePath, "utf8");

  let newContent = "";

  if (dir === "rams-design--rams") {
    // Caso rams: já tem frontmatter, só falta name
    const lines = originalText.split("\n");
    if (lines[0].trim() === "---") {
      newContent = `---\nname: ${skillName}\n${lines.slice(1).join("\n")}`;
    } else {
      newContent = `---\nname: ${skillName}\ndescription: ${JSON.stringify(skillDesc)}\n---\n\n${originalText}`;
    }
  } else if (originalText.startsWith("---name:")) {
    // Caso de frontmatter minificado em 1 linha: ---name: ...description: ...---<body>
    const dashParts = originalText.split("---");
    let body = dashParts.slice(2).join("---").trim();
    if (!body) {
      body = skillDesc;
    }
    // Formatar body com título caso não comece com #
    if (!body.startsWith("#")) {
      const title = skillName
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      body = `# ${title}\n\n${body}`;
    }
    newContent = `---\nname: ${skillName}\ndescription: ${JSON.stringify(skillDesc)}\n---\n\n${body}\n`;
  } else {
    // Caso sem frontmatter (ex: pbakaus, danny, mattpocock)
    // O texto inteiro é o corpo do markdown
    newContent = `---\nname: ${skillName}\ndescription: ${JSON.stringify(skillDesc)}\n---\n\n${originalText.trim()}\n`;
  }

  fs.writeFileSync(filePath, newContent, "utf8");
  fixed++;
  console.log(`[FIXED] ${dir} -> name: ${skillName}`);
}

console.log(`\n🎉 Total reparado com sucesso: ${fixed}/${brokenList.length}`);
