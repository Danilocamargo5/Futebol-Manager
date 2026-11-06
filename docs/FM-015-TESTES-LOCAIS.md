# FM-015 — Estratégia de validação local (sem nuvem)

**Escopo:** roteiro reproduzível para API, painel React e Flutter. Este documento não comprova execução dos testes nem altera infraestrutura.

## Pré-requisitos e isolamento

- Checkout da branch de trabalho baseada em `develop`; Node.js >= 18 e pnpm compatível com o lockfile. Instalar dependências com `pnpm install --frozen-lockfile` na raiz. Não remover as proteções de supply chain do `pnpm-workspace.yaml`.
- Flutter SDK/Dart para mobile; Android SDK para build Android; macOS/Xcode para iOS. O diretório `flutter_app` pode precisar das pastas nativas, conforme FM-012/013.
- Não usar credenciais reais, contas de jogadores, serviços externos, deploy ou AWS. Preferir fixtures e mocks. Não executar `drizzle-kit push` ou `push-force` automaticamente: esses comandos alteram schema e exigem banco de teste isolado e autorização.
- Registrar versões das ferramentas, commit SHA, comandos, saída e código de retorno. Distinguir testes reais de mocks.

## Matriz de execução (a partir da raiz)

| Área | Comando | Evidência esperada | Limite |
| --- | --- | --- | --- |
| Dependências JS | `pnpm install --frozen-lockfile` | Instalação concluída sem alterar lockfile | Exige rede/cache e pnpm |
| Bibliotecas | `pnpm run typecheck:libs` | Código de saída 0 | Não substitui testes |
| Workspace | `pnpm run typecheck` | Código de saída 0 | Verifica tipos |
| API | `pnpm --filter @workspace/api-server test` | Testes Node passando | O script constrói a API antes de executar `tests/*.test.mjs` |
| API build | `pnpm --filter @workspace/api-server build` | Build concluído | Não prova integração com banco |
| Painel | `pnpm --filter @workspace/pelada-pro typecheck` | Código de saída 0 | Não prova fluxo de UI |
| Painel build | `pnpm --filter @workspace/pelada-pro build` | Build concluído | Não prova fluxo de UI |
| Flutter deps | `cd flutter_app && flutter pub get` | Dependências resolvidas | Requer Flutter |
| Flutter análise | `cd flutter_app && flutter analyze` | Sem erros | Requer Flutter |
| Flutter testes | `cd flutter_app && flutter test` | Testes passando, se existentes | Não criar afirmação de cobertura quando não houver `test/` |
| Android | `cd flutter_app && flutter build apk --debug` | APK gerado | Somente após estrutura nativa revisada e Android SDK |
| iOS | `cd flutter_app && flutter build ios --simulator` | Build para simulador | Somente macOS/Xcode e estrutura iOS revisada |

Execute os comandos Flutter separadamente dentro de `flutter_app`. Não executar build iOS em Linux. Não iniciar servidor com acesso externo para validar esta matriz.

## Testes locais de integração — etapas futuras

1. **API:** começar pelos testes existentes em `artifacts/api-server/tests`, sem conexões reais. Adicionar testes de validação, autorização e idempotência usando fixtures sintéticas e dependências isoladas.
2. **Flutter:** criar testes de modelos, sorteio e persistência usando `flutter_test` e `SharedPreferences.setMockInitialValues`; limpar estado entre casos e evitar dependência de relógio ou ordem de execução.
3. **React:** validar contratos e estados do painel com dados sintéticos; não afirmar que testes de UI existem sem conferir scripts e arquivos.
4. **Integração ponta a ponta:** aguardar decisão FM-014 sobre fonte de verdade, autenticação e contratos. Só então definir banco descartável local, endpoints, migrações não destrutivas e limpeza de dados de teste. Não tratar armazenamento local Flutter/React como integração comprovada.

## Checklist para registrar cada execução

- Commit/ref e ambiente (SO, Node, pnpm, Flutter/Dart, Android SDK, Xcode quando aplicável).
- Para cada comando: executado ou não, resultado, falha e causa; guardar logs sem segredos.
- Para mocks: identificar o que foi simulado; para banco: confirmar ambiente isolado.
- Riscos conhecidos: builds não substituem smoke tests; ausência de SDK impede validação mobile; integração Flutter/API segue bloqueada em FM-014.
- Critério de conclusão: roteiro revisado e executado por responsável em ambiente adequado, com falhas tratadas. Até lá, manter PR documental como draft.
