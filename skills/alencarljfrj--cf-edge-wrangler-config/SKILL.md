---
name: cf-edge-wrangler-config
description: Author, review, and deploy Cloudflare Workers configuration (wrangler.jsonc) for the Mega/Scanvol ecosystem. Use when creating or editing a wrangler.jsonc, when declaring Service Bindings (WORKSHOP_SERVICE, MUTUAL_SERVICE, INVENTORY_SERVICE, COMEX_SERVICE, GOVERNANCE_SERVICE), when distinguishing wrangler dev from wrangler deploy, when validating a deploy with --dry-run, when placing secrets vs vars, when extracting a Worker to a new repository, or when troubleshooting 500 errors caused by missing bindings, wrong compatibility_date, or assets misconfiguration.
author: alencarljfrj
version: 1.0.0
tags: [cloudflare, wrangler, workers, deploy, service-bindings, secrets, edge]
---

# Cloudflare Wrangler Configuration

## Quando usar esta skill

Ative quando o trabalho envolver:

- Criar ou editar `wrangler.jsonc` (novo Worker, extração de Worker, ajuste de ambiente).
- Declarar ou revisar **Service Bindings** entre Workers.
- Distinguir `wrangler dev` (local) de `wrangler deploy` (produção).
- Validar um deploy antes de aplicar com `wrangler deploy --dry-run`.
- Colocar segredos no lugar certo (`wrangler secret put` vs `vars` no JSON).
- Extrair um Worker do monorepo para repositório próprio (ajustar paths, remover bindings de monorepo).
- Diagnosticar `500 Internal Server Error` por binding faltante ou `compatibility_date` incompatível.

## Estrutura canônica do `wrangler.jsonc`

```jsonc
{
  "name": "megaa-truks-parts-store",
  "main": "./src/index.ts",
  "compatibility_date": "2026-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  },
  "assets": {
    "directory": "./dist/public",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application"
  },
  "vars": {
    "APP_VERSION": "1.0.0",
    "LOG_LEVEL": "info"
  },
  "services": [
    { "binding": "WORKSHOP_SERVICE", "service": "megaa-scanvol-workshop" },
    { "binding": "MUTUAL_SERVICE",   "service": "megaa-america-guard"  }
  ],
  "hyperdrive": [
    { "binding": "HYPERDRIVE", "id": "0cae6fa5a0c84b8490b925ac0b0e7df0" }
  ]
}
```

**Regras:**
- `compatibility_date` deve ser uma data real no passado. Nunca use data futura (o deploy falha).
- `nodejs_compat` só é necessário se o Worker usa APIs Node (`Buffer`, `crypto`, etc.). Não adicione se não usar.
- `observability.enabled: true` é obrigatório em produção. Sem isso, não há logs.
- `assets` só se o Worker serve frontend estático. Workers de backend puro não precisam.

## `wrangler dev` vs `wrangler deploy`

| Aspecto | `wrangler dev` (local) | `wrangler dev --remote` | `wrangler deploy` |
| :--- | :--- | :--- | :--- |
| Roda localmente | Sim | Não (roda no Cloudflare) | Não |
| Service Bindings funcionam | Não (mock) | Sim (real) | Sim (real) |
| Hyperdrive funciona | Não (usa fallback) | Sim (real) | Sim (real) |
| Secrets disponíveis | Só de `.dev.vars` | Sim (secrets do Cloudflare) | Sim |
| Usa para | Desenvolvimento rápido | Testar binding real | Produção |

**Regra:** o CI **nunca** roda `wrangler dev`; roda `wrangler deploy --dry-run` para validar o build.

## Service Bindings

Service Bindings permitem que um Worker chame outro Worker sem sair da rede Cloudflare (latência mínima, sem egress).

**Declaração no `wrangler.jsonc` do Worker que consome:**

```jsonc
"services": [
  { "binding": "INVENTORY_SERVICE", "service": "megaa-truks-parts-store" }
]
```

**Consumo no código:**

```ts
export default {
  async fetch(request: Request, env: Env) {
    // Encaminha a requisição para o Worker de destino
    const response = await env.INVENTORY_SERVICE.fetch(request);
    return response;
  }
};
```

**Regras:**
- O `binding` é o nome exposto em `env`. Use SCREAMING_SNAKE_CASE.
- O `service` é o nome real do Worker no Cloudflare (`name` do `wrangler.jsonc` de destino).
- Service Binding **só** funciona para Workers na mesma conta Cloudflare.
- O `platform-gateway` **deve** declarar todos os 5 Service Bindings (`WORKSHOP_SERVICE`, `MUTUAL_SERVICE`, `INVENTORY_SERVICE`, `COMEX_SERVICE`, `GOVERNANCE_SERVICE`). Worker de negócio não deve declarar Service Bindings de outros Workers de negócio — apenas o gateway orquestra.

## Secrets vs vars

| Tipo | Onde declarar | Quando usar |
| :--- | :--- | :--- |
| **`vars`** (JSON) | `wrangler.jsonc` | Valores **públicos**, não sensíveis, que variam por ambiente (`APP_VERSION`, `LOG_LEVEL`) |
| **`secrets`** | `wrangler secret put <NAME>` | Valores **sensíveis** (`JWT_SECRET`, `SUPABASE_SECRET_KEY`, `STRIPE_API_KEY`) |
| **`.dev.vars`** | Arquivo local (não commitado) | Secrets para `wrangler dev` local |

**Regra de ouro:** se está no `wrangler.jsonc`, é público. Se você não publicaria num README, é `secret`.

```bash
# Definir secret em prod
echo "valor-secreto" | wrangler secret put JWT_SECRET --env production

# Listar secrets (não mostra valores)
wrangler secret list --env production

# Deletar secret
wrangler secret delete JWT_SECRET --env production
```

## Deploy real vs dry-run

**`wrangler deploy --dry-run`** — valida o build sem enviar para produção. Roda em CI, sempre.

**`wrangler deploy`** — envia para produção. Só rode manualmente ou em workflow `workflow_dispatch`.

**No CI:**

```yaml
- name: Validate Worker build
  run: pnpm wrangler deploy --dry-run --outdir=./dist-worker
```

**No deploy real (workflow separado):**

```yaml
- name: Deploy to Cloudflare
  run: pnpm wrangler deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

**Nunca** rode `wrangler deploy` em PR (apenas `--dry-run`). Deploy só em merge para `main`, com aprovação manual.

## Checklist de pré-deploy

Antes de rodar `wrangler deploy` (real):

- [ ] `pnpm check` passa (TypeScript sem erro).
- [ ] `pnpm test` passa.
- [ ] `wrangler deploy --dry-run` passa.
- [ ] `compatibility_date` é uma data real no passado.
- [ ] Todos os `services` declarados existem no Cloudflare (checar via `wrangler deployments list` de cada um).
- [ ] Nenhum `hyperdrive` declarado em Worker que não acessa banco (`platform-gateway`).
- [ ] `observability.enabled: true`.
- [ ] Secrets necessários existem (`wrangler secret list`).
- [ ] Deploy é o **único** caminho de deploy daquele Worker (o monorepo não deploya mais, após extração).
- [ ] README do repo extraído documenta o comando de deploy e o responsável.

## Extrair Worker do monorepo: ajustes obrigatórios no `wrangler.jsonc`

Ao extrair um Worker (`apps/<sistema>/` → repo próprio):

1. **`$schema`** — trocar `../../node_modules/wrangler/config-schema.json` por `node_modules/wrangler/config-schema.json`.
2. **`main`** — confirmar que aponta para `./src/index.ts` (não `../../server/...`).
3. **`assets.directory`** — se existir, apontar para `./dist/public` (não `../../client/dist`).
4. **`services`** — remover Service Bindings que não fazem sentido no repo extraído (ex: gateway consumido pelo Worker, mas não o inverso).
5. **`hyperdrive`** — manter o mesmo `id` de prod e homologação; usar `wrangler.prod.jsonc` se precisar de IDs distintos.
6. **`name`** — confirmar que é o mesmo nome do Worker em produção (o Service Binding dos outros Workers aponta para esse nome).
7. **`compatibility_date`** — manter ou atualizar conscientemente; nunca regredir.

## Diagnosticar erros de deploy

| Erro | Causa | Correção |
| :--- | :--- | :--- |
| `compatibility_date must not be in the future` | Data futura | Corrigir para data no passado |
| `Binding WORKSHOP_SERVICE is not a valid service binding` | Worker de destino não existe | `wrangler deployments list` no Worker de destino para confirmar |
| `Asset directory not found: ./dist/public` | Build não gerou os assets | Rodar `pnpm build` antes do deploy |
| `HYPERDRIVE is not defined` em runtime | Binding declarado, mas `env.HYPERDRIVE` undefined | Verificar `name` do ambiente no deploy (`--env production`) |
| `Unauthorized` no deploy | `CLOUDFLARE_API_TOKEN` inválido/expirado | Regenerar token com escopo `Workers Scripts:Edit` |
| Worker responde 500 após deploy mas CI estava verde | `wrangler deploy --dry-run` não executou as rotas | Rodar teste de integração real após deploy |
