---
name: cf-edge-hyperdrive-binding
description: Configure, consume, and troubleshoot Cloudflare Hyperdrive bindings in Workers to connect to PostgreSQL (Supabase/Neon) with connection pooling at the edge. Use when wiring @alencarljfrj/database to env.HYPERDRIVE.connectionString, when a Worker returns 500 due to missing DATABASE_URL, when migrating in-memory mocks (memoryRequisitions, initialPartsInventory, mockDossiers) to real Drizzle queries, when writing integration tests against Hyperdrive, or when diagnosing pool exhaustion, timeouts, connection refused, or stale connections in production.
author: alencarljfrj
version: 1.0.0
tags: [cloudflare, hyperdrive, workers, postgres, drizzle, edge, supabase, connection-pooling]
---

# Cloudflare Hyperdrive Binding

## Quando usar esta skill

Ative esta skill quando o trabalho envolver **qualquer** um dos cenários:

- O Worker precisa acessar PostgreSQL (Supabase ou Neon) e o acesso deve passar por Hyperdrive.
- Um Worker retorna 500 com mensagem de `env.HYPERDRIVE` indefinido ou `connectionString` ausente.
- Está migrando um Worker de dados em memória (`initialPartsInventory`, `memoryRequisitions`, `mockReserveFundBalance`, `mockDossiers`) para queries Drizzle reais.
- Precisa escrever teste de integração contra Hyperdrive (não mock).
- Diagnóstico de pool esgotado, timeout, `connection terminated unexpectedly`, ou erro de SSL.

## Por que Hyperdrive (e não conexão direta)

Workers rodam em isolates distribuídos globalmente. Sem Hyperdrive, cada isolate abriria uma nova conexão TCP com o Postgres, o que:

- Estoura o `max_connections` do Supabase (o free tier tem 60).
- Paga latência TCP + TLS a cada cold start.
- Não aproveita pooling entre isolates no mesmo PoP.

Hyperdrive faz **pooling de conexões na borda**, mantendo conexões quentes por PoP e devolvendo ao Worker uma `connectionString` já pooled. O Worker só precisa consumir essa string.

## Estrutura canônica do `wrangler.jsonc`

```jsonc
{
  "name": "megaa-truks-parts-store",
  "main": "./src/index.ts",
  "compatibility_date": "2026-01-01",
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "0cae6fa5a0c84b8490b925ac0b0e7df0"
    }
  ]
}
```

**Regras:**
- O `binding` é o nome exposto em `env.HYPERDRIVE`. Mantenha consistente entre todos os Workers do ecossistema.
- O `id` é gerado pelo Cloudflare Dashboard ao criar o Hyperdrive. **Nunca commite `id` de homolog e prod no mesmo arquivo sem usar `env` do wrangler** — use `wrangler.jsonc` + `wrangler.prod.jsonc` se precisar de IDs distintos.
- Não declare `hyperdrive` no `platform-gateway`. O gateway é stateless por design; adicionar Hyperdrive nele viola a arquitetura de responsabilidades.

## Criar o Hyperdrive no Dashboard

1. Cloudflare Dashboard → **Workers & Pages** → **Hyperdrive** → **Create configuration**.
2. **Name:** `scanvol-fiscal-prod` (ou nome do ambiente).
3. **Connection string:** cole a string de conexão do Supabase:
   ```
   postgres://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
   ```
   **Atenção:** use o **pooler do Supabase** (porta `6543`), não a conexão direta (porta `5432`). O pooler do Supabase já faz pooling; o Hyperdrive refina esse pooling. Se usar `5432`, o Hyperdrive se torna redundante e pode esgotar o pool.
4. **Caching:** desabilitado por padrão. Mantenha desabilitado para dados transacionais (Truks, America Guard, Comex). Habilite apenas para dados de leitura pesada e raramente mutados.
5. Copie o `id` gerado e cole no `wrangler.jsonc`.

## Consumir no client Drizzle (`@alencarljfrj/database`)

**Regra de ouro:** o Worker **nunca** importa `postgres` diretamente. Sempre importa `createDrizzleClient` do pacote compartilhado, que recebe a connection string como argumento.

```ts
// packages/database/src/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export function createDrizzleClient(connectionString: string) {
  const sql = postgres(connectionString, {
    max: 1,            // 1 conexão por request; Hyperdrive faz o pooling
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,    // Hyperdrive não suporta prepared statements em todos os planos
  });
  return { db: drizzle(sql, { schema }), sql };
}
```

```ts
// apps/truks-parts-store/src/index.ts
import { createDrizzleClient } from '@alencarljfrj/database';
import { parts, requisitions } from '@alencarljfrj/database/schema';

export default {
  async fetch(request: Request, env: Env) {
    const { db, sql } = createDrizzleClient(env.HYPERDRIVE.connectionString);
    try {
      const allParts = await db.select().from(parts);
      return Response.json({ items: allParts, total: allParts.length });
    } finally {
      await sql.end({ timeout: 5 });
    }
  }
};
```

**Regras:**
- `max: 1` — o Worker não deve abrir múltiplas conexões; o Hyperdrive já poola.
- `prepare: false` — Hyperdrive não suporta prepared statements em todos os planos.
- Sempre `sql.end()` no `finally` para liberar a conexão de volta ao pool imediatamente.

## Testar localmente

**Sem Hyperdrive local (padrão):**

O `wrangler dev` local **não** tem Hyperdrive real. Duas opções:

1. **Conexão direta ao Supabase (mais simples, mas não testa o binding):**
   ```jsonc
   // .dev.vars (não commitar)
   HYPERDRIVE_CONNECTION_STRING="postgres://postgres.<ref>:<pass>@...pooler.supabase.com:6543/postgres"
   ```
   ```ts
   // src/index.ts — fallback em dev
   const conn = env.HYPERDRIVE?.connectionString ?? env.HYPERDRIVE_CONNECTION_STRING;
   ```

2. **`wrangler dev --remote` (testa o binding real):**
   ```bash
   wrangler dev --remote
   ```
   Este modo conecta ao Hyperdrive real. Mais lento, mas é o único que valida o binding antes do deploy.

## Teste de integração contra Hyperdrive real

O teste de integração **não deve usar mock**. Deve conectar no Hyperdrive real e executar ao menos uma query.

**Estrutura sugerida (`apps/truks-parts-store/test/integration/hyperdrive.test.ts`):**

```ts
import { describe, it, expect } from 'vitest';
import { createDrizzleClient } from '@alencarljfrj/database';
import { sql as rawSql } from 'drizzle-orm';

const conn = process.env.HYPERDRIVE_TEST_CONNECTION_STRING;
if (!conn) throw new Error('HYPERDRIVE_TEST_CONNECTION_STRING não definido');

describe('Hyperdrive binding', () => {
  it('conecta e executa SELECT 1', async () => {
    const { db, sql } = createDrizzleClient(conn);
    try {
      const result = await db.execute(rawSql`SELECT 1 as ok`);
      expect(result).toBeDefined();
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  it('persiste uma requisição de teste e lê de volta', async () => {
    const { db, sql } = createDrizzleClient(conn);
    try {
      await db.insert(requisitions).values({ id: 'test-1', status: 'pending' });
      const found = await db.select().from(requisitions);
      expect(found.some((r) => r.id === 'test-1')).toBe(true);
    } finally {
      await db.delete(requisitions);
      await sql.end({ timeout: 5 });
    }
  });
});
```

**No CI:** rodar esse teste contra um Hyperdrive de **homologação**, nunca produção. Variável `HYPERDRIVE_TEST_CONNECTION_STRING` gerenciada como secret.

## Diagnóstico de problemas comuns

| Sintoma | Causa provável | Correção |
| :--- | :--- | :--- |
| `env.HYPERDRIVE is undefined` | Binding não declarado no `wrangler.jsonc` do ambiente corrente | Verificar se o `env` do deploy tem o bloco `hyperdrive` |
| `connection string is invalid` | Connection string malformada (senha com caractere especial não escapado) | URL-encode a senha; usar connection string do pooler do Supabase (porta 6543) |
| `remaining connection slots are reserved` | Pool esgotado no Supabase (conexões diretas, não via Hyperdrive) | Confirmar que TODOS os Workers usam Hyperdrive e não `postgres()` direto com `5432` |
| `timeout expired` intermitente | `max: 1` sem `sql.end()` no `finally` → conexão vaza | Adicionar `try/finally` em toda rota que cria client |
| `prepared statement already exists` | `prepare: true` em client com Hyperdrive | Trocar para `prepare: false` |
| Dados desaparecem após reinício de isolate | Worker ainda usa memória (`memoryRequisitions`) | Migrar para queries Drizzle reais (esta skill cobre a migração) |

## Checklist antes de promover a produção

- [ ] `wrangler.jsonc` do Worker tem `hyperdrive` com `binding: "HYPERDRIVE"` e `id` correto.
- [ ] `@alencarljfrj/database` expõe `createDrizzleClient` testável fora do Worker.
- [ ] Nenhuma rota do Worker cria `postgres()` direto — todas usam `createDrizzleClient`.
- [ ] Teste de integração contra Hyperdrive real passa no CI.
- [ ] Arrays em memória (`initialPartsInventory`, `memoryRequisitions`, `mockDossiers`, `mockReserveFundBalance`) removidos.
- [ ] Teste manual em produção documentado: `POST` → reiniciar isolate → `GET` retorna o dado persistido.
- [ ] `sql.end()` presente em todas as rotas (grep: `sql.end` deve aparecer mais vezes que `createDrizzleClient`).
