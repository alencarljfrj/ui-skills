---
name: polyrepo-changesets
description: Version, publish, and consume shared packages (@alencarljfrj/auth, @alencarljfrj/database, @alencarljfrj/event-contracts, @alencarljfrj/telemetry, @alencarljfrj/fiscal-core) across the polyrepo ecosystem using Changesets and GitHub Packages. Use when adding a changeset, when bumping package versions across repos, when configuring publishConfig in package.json, when running changeset publish in CI, when a publish fails with 403 (version already exists), when a consumer repo cannot resolve a new version, or when setting up a new repo that depends on shared packages.
author: alencarljfrj
version: 1.0.0
tags: [changesets, polyrepo, github-packages, versioning, npm, monorepo, pnpm]
---

# Changesets & GitHub Packages for Polyrepo

## Quando usar esta skill

Ative quando o trabalho envolver:

- Adicionar um changeset a uma mudança que altera pacote compartilhado.
- Configurar `publishConfig` no `package.json` de um pacote novo.
- Rodar `changeset publish` no CI.
- Um publish falha com `403 Forbidden` (versão já existe).
- Um repo consumidor não consegue resolver `@alencarljfrj/database@^1.x`.
- Configurar um repositório novo para consumir os pacotes privados.
- Migrar pacote de `@megaa/*` para `@alencarljfrj/*`.

## Por que Changesets (e não `npm version` manual)

`npm version` bumpa um pacote e commita. Em polyrepo com 5+ pacotes interdependentes, isso vira caos:

- Não registra **por que** a versão foi bumpada.
- Não agrega múltiplas mudanças num único bump.
- Não atualiza dependências entre pacotes automaticamente.
- Falha na segunda execução se a versão já foi publicada (403).

Changesets resolve os 4 problemas: registra intenção, agrega múltiplas mudanças, propaga bumps entre pacotes (`updateInternalDependencies`), e o `changeset publish` só publica o que mudou.

## Setup inicial (uma vez por monorepo)

```bash
# Na raiz do monorepo que publica os pacotes
pnpm add -D -w @changesets/cli
pnpm changeset init
```

**Ajustar `.changeset/config.json`:**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["apps/*", "client", "server", "worker"]
}
```

**O `ignore` é essencial:** sem ele, o changesets tentaria versionar os apps e o monolito, que não são publicáveis. Apenas `packages/*` deve ser versionado.

## Ajuste obrigatório no `package.json` de cada pacote

Em `packages/auth/package.json` (repetir para `database`, `event-contracts`, `telemetry`, `fiscal-core`):

```json
{
  "name": "@alencarljfrj/auth",
  "version": "1.0.0",
  "private": false,
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/alencarljfrj/ERP_GRUPOMEGAA.git",
    "directory": "packages/auth"
  }
}
```

**Regras:**
- `private: false` é obrigatório. Com `private: true`, `pnpm publish` recusa mesmo com escopo privado.
- `access: restricted` = pacote privado no GitHub Packages. `public` exige repo público.
- O `repository.url` aponta para o monorepo (fonte canônica). Se o pacote for extraído para repo próprio, atualizar antes de publicar.

## Fluxo completo (dia a dia)

### 1. Adicionar changeset após uma mudança

```bash
pnpm changeset
```

Interativo: seleciona pacote(s), bump (`patch`/`minor`/`major`), descrição curta. Gera arquivo em `.changeset/`.

**Exemplo de arquivo gerado** (`.changeset/blue-dogs-run.md`):

```md
---
"@alencarljfrj/database": minor
---

Add createDrizzleClient helper for Hyperdrive binding
```

### 2. Commitar o changeset junto com o código

```bash
git add .changeset/blue-dogs-run.md packages/database/src/
git commit -m "feat(database): add createDrizzleClient for Hyperdrive"
```

### 3. Bump de versões (no CI, antes do publish)

```bash
pnpm changeset version
```

Este comando:
- Consome todos os arquivos `.changeset/*.md` pendentes.
- Bumpa a versão dos pacotes afetados.
- Atualiza `CHANGELOG.md` de cada pacote.
- Atualiza as dependências internas (`@alencarljfrj/*`) em outros pacotes que dependem do bumpado.
- Remove os arquivos `.changeset/*.md` consumidos.

**Commite o resultado** (`pnpm-lock.yaml`, `package.json` bumpados, `CHANGELOG.md`).

### 4. Publicar (no CI, após version)

```bash
pnpm changeset publish
```

Publica apenas os pacotes cuja versão mudou no último `version`. Pacotes sem bump não são republicados.

## Workflow de CI (publicação)

`.github/workflows/publish-packages.yml`:

```yaml
name: Publish Shared Packages

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'packages/**'
      - '.changeset/**'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: 'https://npm.pkg.github.com'
          scope: '@alencarljfrj'

      - run: pnpm install --frozen-lockfile

      - name: Dry-run publish (validação)
        run: pnpm changeset publish --dry-run
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Publish real (apenas manual)
        if: github.event_name == 'workflow_dispatch'
        run: pnpm changeset publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Regras:**
- Push na `main` roda **só** o dry-run (validação).
- Publicação real é **só** via `workflow_dispatch` (deliberado).
- O `--dry-run` antes do publish real evita falha por versão duplicada.

## Consumir os pacotes em um repositório extraído

No `package.json` do repo extraído:

```json
{
  "dependencies": {
    "@alencarljfrj/auth": "^1.0.0",
    "@alencarljfrj/database": "^1.1.0",
    "@alencarljfrj/event-contracts": "^1.0.0",
    "@alencarljfrj/telemetry": "^1.0.0"
  }
}
```

**`.npmrc` do repo extraído:**

```
@alencarljfrj:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Sem a linha `_authToken`, o `pnpm install` falha com `401 Unauthorized` ao resolver os pacotes privados.

**No CI do repo extraído:**

```yaml
- run: pnpm install --frozen-lockfile
  env:
    GITHUB_TOKEN: ${{ secrets.PACKAGES_TOKEN }}
```

O `PACKAGES_TOKEN` deve ser um **fine-grained PAT** com escopo `read:packages` no repositório `ERP_GRUPOMEGAA`. **Nunca** usar `gh auth token` (token OAuth pessoal com escopos amplos).

## Troubleshooting

| Erro | Causa | Correção |
| :--- | :--- | :--- |
| `403 Forbidden` no `changeset publish` | Versão já existe no registry | Rodar `changeset version` antes do publish; o `version` detecta e bumpa |
| `401 Unauthorized` no `pnpm install` do repo consumidor | `.npmrc` sem `_authToken` | Adicionar `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}` |
| `404 Not Found` ao instalar `@alencarljfrj/database` | Pacote não publicado ou escopo errado | Verificar em `https://github.com/alencarljfrj?tab=packages` |
| `Cannot find module '@alencarljfrj/auth'` no build do CI | `pnpm install` do CI sem `--frozen-lockfile` e sem lockfile commitado | Commitar `pnpm-lock.yaml` e rodar com `--frozen-lockfile` |
| Changeset não detectado pelo publish | Arquivo `.changeset/*.md` não commitado | `git add .changeset/` + commit antes de rodar `version` |
| `updateInternalDependencies` não propaga | `ignore` mal configurado | Confirmar que `packages/*` NÃO está em `ignore` |

## Checklist antes de publicar uma nova versão

- [ ] `pnpm test` passa nos pacotes afetados.
- [ ] `pnpm check` passa (TypeScript).
- [ ] Changeset commitado (`git status` mostra `.changeset/*.md` ou `package.json` bumpado).
- [ ] `pnpm changeset publish --dry-run` passa no CI.
- [ ] Versão bumpada é semântica (patch para fix, minor para feature, major para breaking).
- [ ] `CHANGELOG.md` do pacote reflete a mudança.
- [ ] Repos consumidores serão atualizados em seguida (dependência `^x.y.z` — não pular versão).
