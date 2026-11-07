import fs from 'fs';
import path from 'path';

const catalogPath = '/Users/mac/.gemini/antigravity/scratch/ui-skills/catalog.json';
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const byTopic = {};
for (const t of catalog.topics) {
  byTopic[t.slug] = {
    slug: t.slug,
    label: t.label,
    desc: t.description,
    skills: []
  };
}

for (const skill of catalog.registry) {
  for (const top of (skill.topics || [])) {
    if (byTopic[top]) {
      byTopic[top].skills.push(skill);
    }
  }
}

let doc = '';
doc += '# Manual e Documentação Completa do Ecossistema de Skills (1.797 Skills)\n\n';
doc += '> **Catálogo Consolidado de Agentes de IA: UI-Skills + Tiagopgr Skills-IA**  \n';
doc += '> **Total de Habilidades Catalogadas**: 1.797 skills  \n';
doc += '> **Domínios Temáticos**: 40 categorias especializadas  \n';
doc += '> **Padrão de Execução**: `SKILL.md` com YAML Frontmatter compatível com Antigravity, Cursor, Gemini, Claude Code, Windsurf e Codex.  \n';
doc += '> **Repositório Central**: `https://github.com/alencarljfrj/ui-skills`  \n\n';
doc += '---\n\n';

doc += '## 1. Visão Geral e Arquitetura do Sistema\n\n';
doc += 'Este ecossistema de habilidades foi projetado para dotar agentes autônomos de IA de um repertório completo de execução em **Engenharia de Software**, **Design de Interfaces**, **Copywriting Persuasivo**, **Operações Empresariais**, **Inteligência Jurídica**, **Gestão Financeira** e **Estratégia de Negócios**.\n\n';
doc += 'Cada habilidade é armazenada isoladamente em sua respectiva pasta canônica:\n';
doc += '```\n';
doc += 'skills/<autor>--<slug>/SKILL.md\n';
doc += '```\n\n';
doc += '### Como um Agente de IA Ativa uma Skill\n';
doc += '1. **Detecção Semântica Automática**: O agente analisa o prompt do usuário contra os campos `name` e `description` presentes no cabeçalho YAML de cada `SKILL.md`.\n';
doc += '2. **Gatilhos por Palavra-Chave**: Palavras-chave no prompt (ex: *"auditoria WCAG"*, *"estruturar DRE"*, *"contrato de confidencialidade"*, *"animação GSAP com ScrollTrigger"*, *"otimizar LCP"*) ativam imediatamente o contexto da respectiva skill.\n';
doc += '3. **Invocação Explícita**: O desenvolvedor ou o prompt de sistema pode requisitar diretamente a execução de uma skill indicando seu identificador, por exemplo:\n';
doc += '   > `Execute a skill ibelick--baseline-ui para refinar o espaçamento e a hierarquia visual deste componente.`\n\n';

doc += '### Estrutura de Diretórios no Sistema\n';
doc += '- **Repositório Central**: `/Users/mac/.gemini/antigravity/scratch/ui-skills` (espelhado em `/Users/mac/Documents/GitHub/ui-skills`)\n';
doc += '- **Diretório Global de Agentes**: `/Users/mac/.agents/skills/` (contém symlinks para todas as 1.797 skills, permitindo que qualquer ferramenta no macOS tenha acesso instantâneo)\n';
doc += '- **Projetos Locais e Remotos**: Cada repositório possui uma pasta `.agents/skills/` com os links e documentações necessárias.\n\n';

doc += '---\n\n';
doc += '## 2. Índice Geral das 40 Categorias\n\n';
doc += '| # | Categoria / Domínio | Qtd Skills | Descrição do Escopo |\n';
doc += '|---|---|:---:|---|\n';

let i = 1;
for (const t of catalog.topics) {
  const count = byTopic[t.slug]?.skills.length || 0;
  doc += `| ${i++} | [${t.label}](#categoria-${t.slug}) | **${count}** | ${t.description} |\n`;
}

doc += '\n---\n\n';
doc += '## 3. Guia de Consulta Rápida por Área de Atuação\n\n';
doc += '### Para Desenvolvedores Frontend & UI Engineers\n';
doc += '- **Acessibilidade & WCAG**: [Accessibility](#categoria-accessibility) (34 skills) — Auditorias automáticas, foco por teclado e conformidade WCAG 2.2.\n';
doc += '- **Animação & Interações**: [Motion](#categoria-motion) (117 skills) & [Interaction](#categoria-interaction) (105 skills) — GSAP, Framer Motion, spring physics e feedback táctil.\n';
doc += '- **Design Systems & Tokens**: [Systems](#categoria-systems) (130 skills) & [shadcn/ui](#categoria-shadcn-ui-development) (4 skills) — Primitivas Radix, tokens Tailwind e componentes unificados.\n';
doc += '- **Performance & Core Web Vitals**: [Performance](#categoria-performance) (42 skills) — Otimização de LCP, INP, CLS e reduções de bundle.\n';
doc += '- **3D & Vídeo Programático**: [3D](#categoria-3d) (26 skills), [Three.js](#categoria-threejs) (15 skills) & [Remotion](#categoria-remotion) (47 skills).\n\n';

doc += '### Para Fundadores, Gestores de Operações & Executivos\n';
doc += '- **Processos e Procedimentos Padrão**: [Operações & Processos](#categoria-operacoes) (245 skills) — POPs, SLAs, esteiras operacionais e onboarding.\n';
doc += '- **Gestão Financeira & Controladoria**: [Financeiro & Controladoria](#categoria-financeiro) (133 skills) — DRE, fluxo de caixa, precificação e valuation.\n';
doc += '- **Jurídico, Compliance & LGPD**: [Jurídico & Advocacia](#categoria-juridico-advocacia) (55 skills) — Contratos, NDAs, termos de serviço e governança.\n';
doc += '- **Gestão de Pessoas & Liderança**: [Liderança & Gestão de Pessoas](#categoria-lideranca-equipes) (26 skills) — 1:1s, feedbacks e avaliação de desempenho.\n';
doc += '- **Produtividade & Tempo**: [Rotina & Produtividade](#categoria-rotina) (89 skills) — Blocos de foco, GTD e planejamento semanal.\n\n';

doc += '### Para Especialistas em Marketing, Vendas & Conteúdo\n';
doc += '- **Vendas & Prospecção B2B**: [Marketing & Vendas](#categoria-marketing) (220 skills) — Funis de vendas, qualificação SPIN/BANT e pitch de vendas.\n';
doc += '- **Copywriting & Produção Textual**: [Conteúdo & Copywriting](#categoria-conteudo-copy) (210 skills) — VSLs, e-mails de conversão, roteiros para Reels e headlines.\n';
doc += '- **Branding & Identidade de Marca**: [Design & Branding Estratégico](#categoria-design-branding) (24 skills) & [Direção Criativa & Arte](#categoria-direcao-criativa) (20 skills).\n';
doc += '- **SEO & Inteligência de Dados**: [SEO & Análise de Dados](#categoria-seo) (33 skills) — Otimização on-page, estratégia de palavras-chave e dashboards.\n\n';

doc += '---\n\n';
doc += '## 4. Detalhamento Exaustivo das 40 Categorias e Habilidades\n\n';

for (const t of catalog.topics) {
  const topicData = byTopic[t.slug];
  const count = topicData?.skills.length || 0;
  const skills = topicData?.skills || [];

  doc += `### <a id="categoria-${t.slug}"></a>${t.label} (${count} skills)\n\n`;
  doc += `> **Escopo Temático**: ${t.desc}\n\n`;

  doc += '| Skill | Autor | Descrição Operacional | Arquivo |\n';
  doc += '|---|---|---|---|\n';

  const sorted = [...skills].sort((a,b) => a.name.localeCompare(b.name));
  for (const s of sorted) {
    const author = s.user || s.sourceKey || 'ecosystem';
    const folder = `${s.sourceKey || author}--${s.slug}`;
    const cleanDesc = (s.description || '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
    doc += `| **${s.name}** | \`${author}\` | ${cleanDesc} | [\`SKILL.md\`](./skills/${folder}/SKILL.md) |\n`;
  }

  doc += '\n---\n\n';
}

doc += '## 5. Manutenção, Consultas e Atualização\n\n';
doc += '### Pesquisar Skills por Termo via Node.js\n';
doc += '```bash\n';
doc += 'node -e "const c = JSON.parse(require(\'fs\').readFileSync(\'./catalog.json\')); console.log(c.registry.filter(s => s.name.includes(\'contrato\') || s.description.includes(\'contrato\')).map(s => ({ name: s.name, autor: s.user })));"\n';
doc += '```\n\n';

doc += '### Sincronizar Globalmente no macOS\n';
doc += 'Para vincular qualquer nova skill adicionada à pasta global de agentes:\n';
doc += '```bash\n';
doc += 'node scripts/sync-global.mjs\n';
doc += '```\n\n';

doc += '### Replicar para Todos os Repositórios Git\n';
doc += 'Para propagar atualizações em massa para todos os projetos locais e remotos no GitHub:\n';
doc += '```bash\n';
doc += 'python3 scripts/replicate_to_all.py\n';
doc += '```\n';

fs.writeFileSync('/Users/mac/.gemini/antigravity/scratch/ui-skills/MANUAL_DE_SKILLS.md', doc, 'utf8');
console.log('Successfully wrote MANUAL_DE_SKILLS.md! Total size:', (doc.length / 1024 / 1024).toFixed(2), 'MB');
