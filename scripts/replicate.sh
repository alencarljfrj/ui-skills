#!/usr/bin/env bash
# ==============================================================================
# UI Skills Replicator & Multi-Project Git Manager
# ==============================================================================
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_SRC="$REPO_DIR/skills"
CATALOG_FILE="$REPO_DIR/catalog.json"

COLOR_BLUE='\033[0;34m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_CYAN='\033[0;36m'
COLOR_RESET='\033[0m'

print_header() {
  echo -e "${COLOR_CYAN}"
  echo "╔══════════════════════════════════════════════════════════════════════╗"
  echo "║                  UI SKILLS REPLICATOR & GIT SYNC                     ║"
  echo "║       638 Skills para Design Engineers, Microinterações e UI         ║"
  echo "╚══════════════════════════════════════════════════════════════════════╝"
  echo -e "${COLOR_RESET}"
}

print_help() {
  print_header
  echo "Uso: ./scripts/replicate.sh [OPÇÕES]"
  echo ""
  echo "Opções disponíveis:"
  echo "  --global                  Instala/sincroniza globalmente em ~/.agents/skills"
  echo "  --project <CAMINHO>       Instala as skills no projeto especificado e cria commit"
  echo "  --all-local               Localiza projetos Git em ~/Documents/GitHub e ~/Developer,"
  echo "                            instala .agents/skills e comita as alterações"
  echo "  --create-github-repo      Cria o repositório alencarljfrj/ui-skills no GitHub com 'gh'"
  echo "                            e faz o push de todas as 638 skills"
  echo "  --push-all                Executa 'git push' em todos os projetos locais sincronizados"
  echo "  --list-topics             Lista todas as 27 categorias disponíveis"
  echo "  --help                    Exibe este menu de ajuda"
  echo ""
  echo "Exemplos:"
  echo "  ./scripts/replicate.sh --global"
  echo "  ./scripts/replicate.sh --project /Users/mac/Documents/GitHub/Clinicas"
  echo "  ./scripts/replicate.sh --create-github-repo"
  echo "  ./scripts/replicate.sh --all-local"
  echo ""
}

sync_global() {
  echo -e "${COLOR_BLUE}==> Sincronizando com ~/.agents/skills (Global do Sistema)...${COLOR_RESET}"
  node "$REPO_DIR/scripts/sync-global.mjs"
  echo -e "${COLOR_GREEN}✓ Concluído com sucesso!${COLOR_RESET}"
}

install_in_project() {
  local target_proj="$1"
  if [ -z "$target_proj" ] || [ ! -d "$target_proj" ]; then
    echo -e "${COLOR_RED}Erro: Diretório de projeto inválido: '$target_proj'${COLOR_RESET}"
    exit 1
  fi

  local target_skills_dir="$target_proj/.agents/skills"
  echo -e "${COLOR_BLUE}==> Instalando UI Skills em: $target_skills_dir...${COLOR_RESET}"
  mkdir -p "$target_skills_dir"

  # Copiar todas as skills para o projeto (ou criar link simbólico para economia de espaço)
  # Usamos cp -R para que o repositório do projeto possa ser versionado e comitado de forma autônoma
  echo -e "${COLOR_YELLOW}Copiando skills para $target_skills_dir...${COLOR_RESET}"
  cp -R "$SKILLS_SRC/"* "$target_skills_dir/"

  # Copiar também um mini README local de referência no projeto
  cat << 'EOF' > "$target_proj/.agents/skills/README.md"
# UI Skills (Design Engineering & Frontend Skills)
Este diretório contém a biblioteca de UI Skills incorporada para os agentes do projeto.
As skills cobrem Acessibilidade, Animações, Microinterações, Design Systems, Tailwind, shadcn/ui e muito mais.
EOF

  echo -e "${COLOR_GREEN}✓ 638 skills incorporadas em $target_skills_dir!${COLOR_RESET}"

  # Verificar se é repositório Git e criar commit
  if [ -d "$target_proj/.git" ]; then
    echo -e "${COLOR_BLUE}==> Detectado repositório Git. Criando commit...${COLOR_RESET}"
    cd "$target_proj"
    git add .agents/skills
    if git diff --staged --quiet; then
      echo -e "${COLOR_YELLOW}Nenhuma alteração pendente para comitar em $target_proj.${COLOR_RESET}"
    else
      git commit -m "feat(skills): add 638 UI design & engineering skills from ui-skills"
      echo -e "${COLOR_GREEN}✓ Commit gerado com sucesso em $target_proj!${COLOR_RESET}"
    fi
    cd "$REPO_DIR"
  else
    echo -e "${COLOR_YELLOW}(Nota: $target_proj não é um repositório Git, pulando commit)${COLOR_RESET}"
  fi
}

install_all_local() {
  print_header
  echo -e "${COLOR_BLUE}==> Varrendo projetos Git em ~/Documents/GitHub e ~/Developer...${COLOR_RESET}"

  local search_paths=(
    "/Users/mac/Documents/GitHub"
    "/Users/mac/Developer"
  )

  local count=0
  for base_dir in "${search_paths[@]}"; do
    if [ -d "$base_dir" ]; then
      while IFS= read -r git_dir; do
        proj_dir="$(dirname "$git_dir")"
        # Ignorar o próprio repositório ui-skills ou backups se necessário
        if [[ "$proj_dir" == *"ui-skills"* ]] || [[ "$proj_dir" == *"/BACKUP/"* ]]; then
          continue
        fi
        echo -e "\n${COLOR_CYAN}------------------------------------------------------------${COLOR_RESET}"
        echo -e "${COLOR_GREEN}Processando projeto: $proj_dir${COLOR_RESET}"
        install_in_project "$proj_dir"
        ((count++))
      done < <(find "$base_dir" -maxdepth 3 -type d -name ".git")
    fi
  done

  echo -e "\n${COLOR_GREEN}✓ Processo finalizado! $count projetos atualizados e comitados com sucesso!${COLOR_RESET}"
  echo -e "${COLOR_YELLOW}Dica: Execute './scripts/replicate.sh --push-all' para subir aos repositórios remotos do GitHub.${COLOR_RESET}"
}

create_github_repo() {
  print_header
  echo -e "${COLOR_BLUE}==> Criando repositório central no GitHub: alencarljfrj/ui-skills...${COLOR_RESET}"

  cd "$REPO_DIR"

  # Inicializar git local se ainda não foi feito
  if [ ! -d ".git" ]; then
    git init -b main
    git add .
    git commit -m "feat: initial commit of 638 UI skills organized by topic and author"
  fi

  # Verificar se repo já existe no GitHub
  if gh repo view alencarljfrj/ui-skills >/dev/null 2>&1; then
    echo -e "${COLOR_YELLOW}Repositório alencarljfrj/ui-skills já existe no GitHub.${COLOR_RESET}"
    git remote remove origin 2>/dev/null || true
    git remote add origin https://github.com/alencarljfrj/ui-skills.git
    echo -e "${COLOR_BLUE}Fazendo push para main...${COLOR_RESET}"
    git push -u origin main
  else
    echo -e "${COLOR_YELLOW}Criando novo repositório público alencarljfrj/ui-skills no GitHub...${COLOR_RESET}"
    gh repo create alencarljfrj/ui-skills --public --source=. --remote=origin --push
  fi

  echo -e "${COLOR_GREEN}✓ Repositório central disponível em: https://github.com/alencarljfrj/ui-skills${COLOR_RESET}"
}

push_all_projects() {
  print_header
  echo -e "${COLOR_BLUE}==> Enviando commits dos projetos locais para o GitHub (git push)...${COLOR_RESET}"

  local search_paths=(
    "/Users/mac/Documents/GitHub"
    "/Users/mac/Developer"
  )

  for base_dir in "${search_paths[@]}"; do
    if [ -d "$base_dir" ]; then
      while IFS= read -r git_dir; do
        proj_dir="$(dirname "$git_dir")"
        if [[ "$proj_dir" == *"/BACKUP/"* ]]; then
          continue
        fi
        echo -e "\n${COLOR_CYAN}------------------------------------------------------------${COLOR_RESET}"
        echo -e "${COLOR_GREEN}Projeto: $proj_dir${COLOR_RESET}"
        cd "$proj_dir"
        if git remote get-url origin >/dev/null 2>&1; then
          local current_branch
          current_branch=$(git branch --show-current || echo "main")
          echo -e "Fazendo push da branch '${current_branch}' para origin..."
          git push origin "$current_branch" || echo -e "${COLOR_YELLOW}Aviso: push falhou ou sem upstream configurado.${COLOR_RESET}"
        else
          echo -e "${COLOR_YELLOW}Sem remote origin configurado.${COLOR_RESET}"
        fi
        cd "$REPO_DIR"
      done < <(find "$base_dir" -maxdepth 3 -type d -name ".git")
    fi
  done
  echo -e "\n${COLOR_GREEN}✓ Push concluído!${COLOR_RESET}"
}

list_topics() {
  print_header
  echo -e "${COLOR_BLUE}Tópicos e Categorias Disponíveis:${COLOR_RESET}\n"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$CATALOG_FILE', 'utf-8'));
    for (const t of data.topics) {
      console.log('- ' + t.slug.padEnd(24) + ' : ' + t.label + ' (' + (t.description || '') + ')');
    }
  "
}

# ------------------------------------------------------------------------------
# Dispatcher
# ------------------------------------------------------------------------------
case "$1" in
  --global)
    sync_global
    ;;
  --project)
    install_in_project "$2"
    ;;
  --all-local)
    install_all_local
    ;;
  --create-github-repo)
    create_github_repo
    ;;
  --push-all)
    push_all_projects
    ;;
  --list-topics)
    list_topics
    ;;
  --help|*)
    print_help
    ;;
esac
