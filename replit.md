# Pelada Pro

Aplicativo Flutter para organizar futebol amador, com cadastro de times e jogadores, avaliações por posição, sorteio equilibrado, registro de partidas e rankings.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `flutter_app/` — projeto Flutter multiplataforma com o código do aplicativo.
- `flutter_app/lib/models.dart` — entidades de times, jogadores e partidas.
- `flutter_app/lib/app_state.dart` — estado e persistência local.
- `flutter_app/lib/main.dart` — telas, navegação e fluxos principais.

## Architecture decisions

- A primeira versão usa persistência local com `shared_preferences`, sem exigir servidor ou cadastro de conta.
- O sorteio usa a média das avaliações e distribuição alternada para equilibrar as duas equipes.
- O projeto é Flutter puro para permitir publicação no Android e iOS a partir da mesma base.

## Product

- Cadastro e manutenção de times e jogadores.
- Avaliação de nível de 0 a 3 estrelas para goleiro, defesa, meio e ataque.
- Marcação de presença, sorteio de times e registro de placar/gols.
- Rankings de artilheiros e melhores goleiros por semana, mês e ano.

## User preferences

- O usuário prefere Flutter e não domina Expo/React Native.
- Se Flutter não puder ser executado no ambiente, prefere uma alternativa que possa ser visualizada e usada diretamente no Replit.

## Gotchas

- O diretório Flutter precisa ser aberto com Flutter instalado; este ambiente não possui o SDK Flutter para validar ou executar o app.
- Execute `flutter pub get` antes de rodar o aplicativo.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
