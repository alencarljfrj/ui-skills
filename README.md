# UI Skills Library (Design Engineering & Frontend Skills)

Coleção completa de **638 skills de UI, Design Engineering, Microinterações, Animações e Arquitetura Frontend** sincronizadas do [UI Skills](https://www.ui-skills.com/skills).

Esta estrutura foi organizada especificamente para:
1. **Integração Global nesta aplicação**: Carregamento automático no ambiente do agente via `~/.agents/skills/`.
2. **Uso por Projeto**: Instalação no padrão `.agents/skills/` para projetos locais (como Clinicas, GRP_SCANVOL, Central-IA, etc.).
3. **Replicação Git e GitHub**: Scripts automatizados para comitar e enviar para qualquer repositório GitHub da conta.

---

## Estrutura de Pastas

```
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
```

---

## Como Utilizar e Replicar

### 1. Disponibilizar Globalmente na Aplicação (Todas as sessões de agentes)
Para vincular as skills diretamente ao diretório global de agentes da máquina:
```bash
./scripts/replicate.sh --global
```
Isso disponibiliza as skills para o Antigravity, Gemini Code, Cursor e Claude Code em qualquer pasta aberta no computador.

### 2. Replicar para um Projeto Específico
Para copiar as skills (ou um pacote selecionado) para a pasta `.agents/skills` do seu projeto e já gerar o commit no Git:
```bash
./scripts/replicate.sh --project /caminho/do/seu/projeto
```
Exemplo:
```bash
./scripts/replicate.sh --project /Users/mac/Documents/GitHub/Clinicas
```

### 3. Replicar para Todos os Projetos Locais
Para varrer todas as pastas Git em `~/Documents/GitHub` e `~/Developer` e instalar a pasta de skills com commit pronto:
```bash
./scripts/replicate.sh --all-local
```

### 4. Criar e Publicar o Repositório Central no seu GitHub (`alencarljfrj/ui-skills`)
Para criar o repositório na sua conta do GitHub automaticamente com o GitHub CLI (`gh`):
```bash
./scripts/replicate.sh --create-github-repo
```
Isso cria o repositório remoto `https://github.com/alencarljfrj/ui-skills` e faz o push da branch `main`.

### 5. Enviar os Commits para os Repositórios Remotos do GitHub
Após rodar nos projetos locais:
```bash
./scripts/replicate.sh --push-all
```

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
