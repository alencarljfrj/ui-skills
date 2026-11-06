import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = "/Users/mac/.gemini/antigravity/scratch/ui-skills";
const CATALOG_FILE = path.join(ROOT_DIR, "catalog.json");
const INDEX_FILE = path.join(ROOT_DIR, "INDEX.md");
const README_FILE = path.join(ROOT_DIR, "README.md");

async function run() {
  const raw = await fs.readFile(CATALOG_FILE, "utf-8");
  const data = JSON.parse(raw);
  const skills = data.registry || [];
  const topics = data.topics || [];

  // Group skills by topic
  const topicMap = new Map();
  for (const t of topics) {
    topicMap.set(t.slug, { ...t, items: [] });
  }

  // Also collect untracked topics
  const untracked = [];

  for (const skill of skills) {
    if (skill.topics && skill.topics.length > 0) {
      for (const top of skill.topics) {
        if (topicMap.has(top)) {
          topicMap.get(top).items.push(skill);
        } else {
          if (!topicMap.has(top)) {
            topicMap.set(top, { slug: top, label: top, description: "", items: [] });
          }
          topicMap.get(top).items.push(skill);
        }
      }
    } else {
      untracked.push(skill);
    }
  }

  // Build INDEX.md
  let indexMd = `# Catálogo Completo de UI Skills (638 Skills)

Este repositório contém a coleção completa e organizada de **638 UI Skills** obtidas de [ui-skills.com](https://www.ui-skills.com/skills), prontas para serem incorporadas na estrutura de agentes (Antigravity, Gemini, Cursor, Claude Code, Codex, Windsurf) e replicadas em qualquer repositório Git.

---

## Índice Rápido por Tópico

`;

  for (const [slug, topic] of topicMap.entries()) {
    indexMd += `- [${topic.label} (${topic.items.length})](#topico-${slug})\n`;
  }

  indexMd += `\n---\n\n`;

  // Write topics sections
  for (const [slug, topic] of topicMap.entries()) {
    indexMd += `### <a id="topico-${slug}"></a>${topic.label} (${topic.items.length} skills)\n\n`;
    if (topic.description) {
      indexMd += `*${topic.description}*\n\n`;
    }
    indexMd += `| Skill | Autor | Descrição | Arquivo |\n`;
    indexMd += `|---|---|---|---|\n`;

    // Sort items
    topic.items.sort((a, b) => a.slug.localeCompare(b.slug));

    for (const item of topic.items) {
      const folderName = `${item.user}--${item.slug}`;
      const relPath = `skills/${folderName}/SKILL.md`;
      const desc = (item.description || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
      indexMd += `| **${item.slug}** | [${item.user}](https://github.com/${item.user}) | ${desc} | [\`SKILL.md\`](./${relPath}) |\n`;
    }
    indexMd += `\n`;
  }

  await fs.writeFile(INDEX_FILE, indexMd, "utf-8");
  console.log("INDEX.md generated successfully!");

  // Build README.md
  const readmeMd = `# UI Skills Library (Design Engineering & Frontend Skills)

Coleção completa de **638 skills de UI, Design Engineering, Microinterações, Animações e Arquitetura Frontend** sincronizadas do [UI Skills](https://www.ui-skills.com/skills).

Esta estrutura foi organizada especificamente para:
1. **Integração Global nesta aplicação**: Carregamento automático no ambiente do agente via \`~/.agents/skills/\`.
2. **Uso por Projeto**: Instalação no padrão \`.agents/skills/\` para projetos locais (como Clinicas, GRP_SCANVOL, Central-IA, etc.).
3. **Replicação Git e GitHub**: Scripts automatizados para comitar e enviar para qualquer repositório GitHub da conta.

---

## Estrutura de Pastas

\`\`\`
ui-skills/
├── skills/                     # Todas as 638 skills organizadas no formato canônico
│   ├── ibelick--baseline-ui/
│   │   └── SKILL.md
│   ├── addyosmani--accessibility/
│   │   ├── SKILL.md
│   │   └── references/
│   └── ...
├── skills-by-topic/            # 27 categorias organizadas com atalhos para fácil busca
│   ├── accessibility/
│   ├── motion/
│   ├── systems/
│   ├── visual/
│   ├── craft/
│   ├── taste/
│   ├── shadcn-ui-development/
│   └── ...
├── scripts/                    # Scripts de download, automação e replicação
│   ├── replicate.sh            # Script CLI para replicar em projetos e no GitHub
│   ├── sync-global.mjs         # Sincroniza com ~/.agents/skills
│   └── ...
├── catalog.json                # Manifesto estruturado com metadados de todas as 638 skills
├── INDEX.md                    # Catálogo navegável com links e descrições
└── README.md                   # Esta documentação
\`\`\`

---

## Como Utilizar e Replicar

### 1. Disponibilizar Globalmente na Aplicação (Todas as sessões de agentes)
Para vincular as skills diretamente ao diretório global de agentes da máquina:
\`\`\`bash
./scripts/replicate.sh --global
\`\`\`
Isso disponibiliza as skills para o Antigravity, Gemini Code, Cursor e Claude Code em qualquer pasta aberta no computador.

### 2. Replicar para um Projeto Específico
Para copiar as skills (ou um pacote selecionado) para a pasta \`.agents/skills\` do seu projeto e já gerar o commit no Git:
\`\`\`bash
./scripts/replicate.sh --project /caminho/do/seu/projeto
\`\`\`
Exemplo:
\`\`\`bash
./scripts/replicate.sh --project /Users/mac/Documents/GitHub/Clinicas
\`\`\`

### 3. Replicar para Todos os Projetos Locais
Para varrer todas as pastas Git em \`~/Documents/GitHub\` e \`~/Developer\` e instalar a pasta de skills com commit pronto:
\`\`\`bash
./scripts/replicate.sh --all-local
\`\`\`

### 4. Criar e Publicar o Repositório Central no seu GitHub (\`alencarljfrj/ui-skills\`)
Para criar o repositório na sua conta do GitHub automaticamente com o GitHub CLI (\`gh\`):
\`\`\`bash
./scripts/replicate.sh --create-github-repo
\`\`\`
Isso cria o repositório remoto \`https://github.com/alencarljfrj/ui-skills\` e faz o push da branch \`main\`.

### 5. Enviar os Commits para os Repositórios Remotos do GitHub
Após rodar nos projetos locais:
\`\`\`bash
./scripts/replicate.sh --push-all
\`\`\`

---

## Tópicos Inclusos

- **Accessibility**: Acessibilidade web, conformidade WCAG 2.2, suporte a leitores de tela.
- **Motion & Transitions**: Animações fluidas, transições de estado, microinterações, GSAP, Framer Motion.
- **Systems & Architecture**: Design systems, tokens de design, component canvas, DESIGN.md.
- **Visual & Taste**: Direção estética, anti-generic styling, hierarquia visual, espaçamento.
- **Craft & Execution**: Acabamento de produto, atenção a detalhes, estados de loading e erro.
- **Frameworks**: Next.js, React, Vue, Nuxt, Svelte, Tailwind CSS, shadcn/ui.
- **E muito mais** (Three.js, 3D, SwiftUI, Video/Remotion, Testes, Debugging).

Consulte o arquivo [INDEX.md](./INDEX.md) para a lista detalhada de cada uma das 638 skills.
`;

  await fs.writeFile(README_FILE, readmeMd, "utf-8");
  console.log("README.md generated successfully!");
}

run().catch(console.error);
