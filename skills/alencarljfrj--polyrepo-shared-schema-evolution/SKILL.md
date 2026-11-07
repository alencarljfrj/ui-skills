---
name: polyrepo-shared-schema-evolution
description: Evolve the shared Drizzle schema in @alencarljfrj/database without breaking the 5 consumer repositories (truks-parts-store, megaa-platform-gateway, megaa-america-guard, megaa-comex, megaa-governance). Use when adding a column, removing a field, renaming a table, changing a type, running a Drizzle migration across repos, deciding whether a change is patch/minor/major, testing the package against all consumers before publishing, or coordinating a breaking change rollout.
author: alencarljfrj
version: 1.0.0
tags: [polyrepo, database, drizzle, schema, migrations, versioning, breaking-changes]
---

# Shared Schema Evolution

## Quando usar esta skill

Ative quando o trabalho envolver:

- Adicionar uma coluna, tabela ou índice em `@alencarljfrj/database`.
- Remover ou renomear um campo existente.
- Alterar um tipo (`varchar` → `text`, `int` → `bigint`, etc.).
- Rodar uma migration Drizzle que afeta múltiplos consumidores.
- Decidir se uma mudança é `patch`, `minor` ou `major`.
- Coordenar rollout de mudança breaking em 5 repos.

## Princípio central

**O schema é contrato.** O pacote `@alencarljfrj/database` é consumido por 5 repositórios em ritmos diferentes de deploy. Uma mudança que parece trivial (renomear coluna) pode quebrar 3 repos em produção se não for coordenada.

Regra de ouro: **nunca remova ou renomeie antes de deprecar.**

## Matriz de compatibilidade

Manter a matriz atualizada no README do pacote:

| Repo consumidor | Versão de `@alencarljfrj/database` | Última migration aplicada | Compatível com `2.x`? |
| :--- | :--- | :--- | :---: |
| `truks-parts-store` | [PREENCHER: ex. `1.2.0`] | [PREENCHER] | [PREENCHER] |
| `megaa-platform-gateway` | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| `megaa-america-guard` | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| `megaa-comex` | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| `megaa-governance` | [PREENCHER] | [PREENCHER] | [PREENCHER] |

**[PREENCHER]** — definir no README do pacote como essa matriz é mantida (manual? script?) e qual é a cadência de atualização (por sprint? por release?).

## Classificação de mudanças

### Patch (`1.0.x`) — sempre seguro
- Adicionar coluna **nullable** sem default (a menos que o consumidor use `NOT NULL` no insert).
- Adicionar índice.
- Adicionar tabela nova (sem FKs para tabelas existentes).
- Adicionar função utilitária nova.

### Minor (`1.x.0`) — compatível, mas consumidor precisa agir
- Adicionar coluna com default e `NOT NULL` (consumidor precisa incluir no insert).
- Adicionar FK de tabela existente para tabela nova.
- Adicionar campo em view materializada.
- **[PREENCHER]** — outras regras específicas do schema do projeto.

### Major (`2.0.0`) — quebra
- Remover coluna.
- Renomear coluna.
- Alterar tipo incompatível (`varchar` → `int`).
- Remover tabela.
- Adicionar `NOT NULL` em coluna existente sem default.
- **[PREENCHER]** — outras regras específicas.

## Ciclo de deprecação (obrigatório antes de major)

**[PREENCHER]** — definir o ciclo formal. Exemplo de referência:

1. **Versão N:** coluna antiga mantida + coluna nova adicionada + query `SELECT` retorna as duas (o consumidor escolhe).
2. **Versão N+1:** documentar no `CHANGELOG.md` que a coluna antiga será removida em N+2.
3. **Versão N+2 (major):** remover coluna antiga.

O prazo entre N e N+2 é decisão do time: [PREENCHER: ex. "2 sprints" / "1 mês" / "conforme cadência de deploy de cada repo"].

## Como versionar migrations Drizzle

**[PREENCHER]** — definir o fluxo. Pontos a decidir:

- Onde as migrations SQL vivem (`packages/database/migrations/`?).
- Como são aplicadas (`drizzle-kit migrate`? script próprio?).
- Quem executa em produção (CI? manual?).
- Rollback: existe? Se não, por quê?
- Como o consumidor sabe qual versão de migration está aplicada (tabela `__drizzle_migrations`?).

## Teste multi-repo antes de publicar

**[PREENCHER]** — definir o gate. Pontos a decidir:

- O pacote é testado contra os 5 consumidores antes de publicar? (idealmente sim)
- Como? (workflow `matrix` com os 5 repos? testes de integração locais? feature flags?)
- Se um consumidor quebra, o publish é bloqueado ou o consumidor migra depois?

## Coordenação de breaking change

**[PREENCHER]** — definir o processo. Pontos a decidir:

- Quem aprova um major?
- Como avisar os 5 consumidores (issue? Slack? email?).
- Ordem de deploy: monorepo? repos extraídos em ordem específica?
- Janela de deploy (fim de semana? horário comercial?).
- Rollback se algo quebrar no meio.

## Checklist antes de publicar mudança de schema

- [ ] Mudança classificada como patch/minor/major conforme regras acima.
- [ ] Matriz de compatibilidade atualizada.
- [ ] Se major: ciclo de deprecação foi respeitado (versão N+1 já saiu com aviso).
- [ ] Migration Drizzle testada localmente contra banco real.
- [ ] Teste de integração multi-repo roda e passa (ou gate documentado se não existir).
- [ ] `CHANGELOG.md` do pacote reflete a mudança e o impacto nos consumidores.
- [ ] Changeset bumpado com a versão correta.
- [ ] Consumidores notificados (se major).
- [ ] Rollback documentado (se aplicável).

## O que NÃO fazer

- Nunca remover coluna em uma release que não seja major.
- Nunca renomear coluna diretamente; adicione a nova, deprecie a antiga, remova depois.
- Nunca alterar tipo de coluna que está em produção sem migration de dados associada.
- Nunca publicar major sem notificar os 5 consumidores.

## Referências internas

- [PREENCHER: link para `packages/database/README.md`]
- [PREENCHER: link para `packages/database/migrations/`]
- [PREENCHER: link para o runbook de migrations em produção]
