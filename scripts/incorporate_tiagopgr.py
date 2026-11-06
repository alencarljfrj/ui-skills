import os
import sys
import shutil
import json
import re

ROOT_DIR = "/Users/mac/.gemini/antigravity/scratch/ui-skills"
SKILLS_DIR = os.path.join(ROOT_DIR, "skills")
TOPICS_DIR = os.path.join(ROOT_DIR, "skills-by-topic")
CATALOG_FILE = os.path.join(ROOT_DIR, "catalog.json")
TIAGO_SRC = "/tmp/tiagopgr_skills/skills"

CATEGORY_METADATA = {
    "operacoes": {"label": "Operações & Processos", "description": "SOPs, POPs, delegação, onboarding, gestão de projetos e automações operacionais."},
    "marketing": {"label": "Marketing & Vendas", "description": "Funis de venda, campanhas de tráfego pago, propostas comerciais e lançamentos."},
    "conteudo-copy": {"label": "Conteúdo & Copywriting", "description": "Headlines, hooks, carrosséis, roteiros de Reels, VSLs, e-mails e páginas de venda."},
    "financeiro": {"label": "Financeiro & Controladoria", "description": "Fluxo de caixa, DRE gerencial, precificação, contratos e planejamento tributário."},
    "rotina": {"label": "Rotina & Produtividade", "description": "Planejamento semanal, batching, GTD, blocos de foco e gestão de múltiplos projetos."},
    "juridico-advocacia": {"label": "Jurídico & Advocacia", "description": "Petições, contestações, pareceres, contratos e gestão de escritório advocatício."},
    "produto": {"label": "Produto & Negócios", "description": "KPIs, lançamento de produtos digitais, otimização de conversão e análise de churn."},
    "carreira": {"label": "Carreira & Posicionamento", "description": "Posicionamento profissional, LinkedIn, currículos e mentoria."},
    "seo": {"label": "SEO & Análise de Dados", "description": "Métricas, pesquisa de mercado, análise de concorrência e funil de conversão."},
    "lideranca-equipes": {"label": "Liderança & Gestão de Pessoas", "description": "OKRs, feedback estruturado, onboarding de equipe e avaliação de desempenho."},
    "design-branding": {"label": "Design & Branding Estratégico", "description": "Briefing estratégico, proposta de identidade visual, naming e precificação de design."},
    "codigo": {"label": "Engenharia de Software & DevOps", "description": "Debugging sistemático, APIs RESTful, CI/CD, Docker, code review e testes unitários."},
    "direcao-criativa": {"label": "Direção Criativa & Arte", "description": "Conceito de campanhas, direção de arte, narrativa visual e portfólio criativo."}
}

def parse_frontmatter(content):
    name = ""
    desc = ""
    match = re.search(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if match:
        fm = match.group(1)
        m_name = re.search(r"^name:\s*(.+)$", fm, re.MULTILINE)
        if m_name:
            name = m_name.group(1).strip().strip('"').strip("'")
        m_desc = re.search(r"^description:\s*(.+)$", fm, re.MULTILINE)
        if m_desc:
            desc = m_desc.group(1).strip().strip('"').strip("'")
    return name, desc

def main():
    print(f"Incorporando skills de {TIAGO_SRC} em {ROOT_DIR}...")

    with open(CATALOG_FILE, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    existing_registry = catalog.get("registry", [])
    existing_topics = {t["slug"]: t for t in catalog.get("topics", [])}

    # Add new topics to catalog
    for cat_slug, meta in CATEGORY_METADATA.items():
        if cat_slug not in existing_topics:
            existing_topics[cat_slug] = {
                "slug": cat_slug,
                "label": meta["label"],
                "description": meta["description"],
                "isDesignCore": False
            }
        os.makedirs(os.path.join(TOPICS_DIR, cat_slug), exist_ok=True)

    imported_count = 0
    categories = [d for d in os.listdir(TIAGO_SRC) if os.path.isdir(os.path.join(TIAGO_SRC, d))]

    for cat in sorted(categories):
        cat_skills_dir = os.path.join(TIAGO_SRC, cat, "skills")
        if not os.path.exists(cat_skills_dir):
            continue

        skill_dirs = [s for s in os.listdir(cat_skills_dir) if os.path.isdir(os.path.join(cat_skills_dir, s))]
        print(f"Processando categoria '{cat}': {len(skill_dirs)} skills...")

        for sname in skill_dirs:
            src_folder = os.path.join(cat_skills_dir, sname)
            src_skill_md = os.path.join(src_folder, "SKILL.md")
            if not os.path.exists(src_skill_md):
                continue

            with open(src_skill_md, "r", encoding="utf-8") as f:
                content = f.read()

            parsed_name, parsed_desc = parse_frontmatter(content)
            skill_name = parsed_name or sname
            skill_desc = parsed_desc or f"Skill profissional para {cat}: {sname}"

            # Target canonical folder: tiagopgr--<sname>
            folder_name = f"tiagopgr--{sname}"
            dest_folder = os.path.join(SKILLS_DIR, folder_name)
            os.makedirs(dest_folder, exist_ok=True)

            # Copy all files from src_folder
            for f in os.listdir(src_folder):
                sf = os.path.join(src_folder, f)
                df = os.path.join(dest_folder, f)
                if os.path.isfile(sf):
                    shutil.copy2(sf, df)
                elif os.path.isdir(sf):
                    if os.path.exists(df):
                        shutil.rmtree(df, ignore_errors=True)
                    shutil.copytree(sf, df)

            # Symlink under topic
            topic_folder = os.path.join(TOPICS_DIR, cat)
            symlink_path = os.path.join(topic_folder, folder_name)
            try:
                rel = os.path.relpath(dest_folder, topic_folder)
                if os.path.islink(symlink_path) or os.path.exists(symlink_path):
                    os.unlink(symlink_path)
                os.symlink(rel, symlink_path)
            except Exception as e:
                pass

            # Register in catalog
            entry = {
                "slug": sname,
                "user": "tiagopgr",
                "repo": "skills-ia",
                "rawUrl": f"https://raw.githubusercontent.com/tiagopgr/skills-ia/main/skills/{cat}/skills/{sname}/SKILL.md",
                "githubUrl": f"https://github.com/tiagopgr/skills-ia/tree/main/skills/{cat}/skills/{sname}",
                "name": skill_name,
                "topics": [cat],
                "description": skill_desc,
                "pathSlug": f"tiagopgr/{sname}",
                "sourceKey": "tiagopgr",
                "sourceLabel": "Tiago PGR"
            }
            existing_registry.append(entry)
            imported_count += 1

    catalog["registry"] = existing_registry
    catalog["topics"] = list(existing_topics.values())

    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f"\nImportação concluída com sucesso! {imported_count} novas skills adicionadas.")
    print(f"Total agora no catálogo: {len(existing_registry)} skills em {len(catalog['topics'])} categorias.")

if __name__ == "__main__":
    main()
