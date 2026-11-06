# Backlog do Futebol-Manager

> Fonte de prioridades do MVP. **Estado inicial provisório**: confirmar implementação real no código antes de iniciar qualquer item. O README pode estar desatualizado. Não tratar itens abaixo como funcionalidades comprovadamente ausentes.

## Regras de execução

- Trabalhar **uma entrega pequena por execução**, escolhendo o primeiro item de maior prioridade que ainda precise de trabalho e não tenha PR em andamento.
- Antes de codificar, inspecionar o código, issues, PRs e dependências; registrar evidência do que já funciona.
- Para tarefas com decisões de produto, integração externa, custo, privacidade ou arquitetura, propor uma solução e pedir aprovação antes de implementar.
- Preferir tarefas que possam ser testadas isoladamente. Se não for possível validar, registrar a limitação e manter PR como draft.
- Atualizar este arquivo em PRs de funcionalidade quando o estado for comprovado; marcar DONE somente depois de merge em develop.

## Estados

- **A VALIDAR**: verificar se já existe e se funciona.
- **TODO**: ausência ou lacuna confirmada, pronta para implementação.
- **IN PROGRESS**: branch/PR aberto (referenciar PR).
- **BLOCKED**: decisão ou dependência pendente.
- **DONE**: implementado, validado e integrado em develop.

## P0 — Estratégia mobile e validação local (prioridade imediata)

| ID | Entrega | Estado inicial | Critérios de aceite |
| --- | --- | --- | --- |
| FM-011 | Auditoria do Flutter atual | IN PROGRESS ([PR #30](https://github.com/Danilocamargo5/Futebol-Manager/pull/30); validação Flutter pendente) | Inspecionar `flutter_app`, mapear telas e funcionalidades reais, dependências, persistência e lacunas; rodar `flutter pub get`, `flutter analyze` e `flutter test` se houver SDK disponível; reportar impedimentos. |
| FM-012 | Preparar e testar Android localmente | IN PROGRESS ([PR #31](https://github.com/Danilocamargo5/Futebol-Manager/pull/31); preparação documentada, SDK/build pendentes) | Verificar pastas nativas, executar testes e build Android quando SDKs estiverem disponíveis; sem publicação em loja. |
| FM-013 | Preparar e testar iOS localmente | A VALIDAR | Verificar estrutura iOS; em macOS com Xcode disponível, validar build/simulador; em ambiente Linux, registrar limitação e não alegar build iOS. |
| FM-014 | Definir integração Flutter ↔ API compartilhada | BLOCKED | Mapear contratos e dados existentes; propor arquitetura, autenticação e sincronização antes de implementar mudanças estruturais. |
| FM-015 | Estratégia de testes locais e integração sem nuvem | IN PROGRESS ([PR #33](https://github.com/Danilocamargo5/Futebol-Manager/pull/33); roteiro documental, execução pendente) | Documentar comandos reproduzíveis para API, web e Flutter, testes automatizados e banco local quando necessário; nenhum recurso AWS criado. |

**Direção do produto:** Flutter será o aplicativo principal Android/iOS; React será o painel web administrativo; a API será compartilhada. Essa direção não autoriza reescrever funcionalidades existentes nem criar infraestrutura sem aprovação.

## P0 — MVP essencial

| ID | Entrega | Estado inicial | Critérios de aceite |
| --- | --- | --- | --- |
| FM-001 | Identificar fluxo atual e arquitetura de autenticação/administrador | A VALIDAR | Mapear login, papéis e persistência; propor lacunas sem introduzir provedor externo sem aprovação. |
| FM-002 | Cadastro e gerenciamento de jogadores | A VALIDAR | Criar, listar, editar e desativar jogadores; validar campos e evitar duplicidade; testes aplicáveis. |
| FM-003 | Criação e gestão de partidas | A VALIDAR | Criar, editar e consultar partidas com data, horário, local e status; validar entradas. |
| FM-004 | Confirmação de presença | A VALIDAR | Confirmar/recusar participação; impedir respostas duplicadas; exibir lista e estado atualizado. |

## P1 — Organização das peladas

| ID | Entrega | Estado inicial | Critérios de aceite |
| --- | --- | --- | --- |
| FM-005 | Sorteio de times | A VALIDAR | Gerar times sem duplicar jogadores, respeitando confirmados e critérios documentados; testes determinísticos. |
| FM-006 | Convites e respostas pelo WhatsApp | BLOCKED | Definir integração autorizada, consentimento, custos, segurança, webhooks, retry e idempotência antes de desenvolver. |
| FM-007 | Validações, idempotência e tratamento de falhas | A VALIDAR | Evitar operações duplicadas; respostas consistentes; testes para erros e retentativas relevantes. |

## P2 — Evolução do produto

| ID | Entrega | Estado inicial | Critérios de aceite |
| --- | --- | --- | --- |
| FM-008 | Estatísticas de jogos e jogadores | A VALIDAR | Registrar resultados, gols e assistências com regras consistentes. |
| FM-009 | Notificações e lembretes | BLOCKED | Definir canal, consentimento, frequência e custos antes de integrar serviços. |
| FM-010 | Painel administrativo | A VALIDAR | Visão de partidas, jogadores e confirmações com permissões adequadas. |

## Política local-first e controle de custos

1. **Validar localmente antes de qualquer cloud:** lint/analyze, typecheck, testes unitários, integração, builds e smoke tests quando ferramentas estiverem disponíveis.
2. **Backend/web:** usar os scripts reais do monorepo (`pnpm run typecheck`, `pnpm run build` e testes dos pacotes pertinentes). Registrar comandos, resultados e limitações.
3. **Flutter:** dentro de `flutter_app`, preferir `flutter pub get`, `flutter analyze`, `flutter test`. Executar build Android somente com SDK Android; build iOS/simulador somente em macOS com Xcode configurado.
4. **Serviços e dados:** preferir mocks, fixtures, serviços locais e banco local/contêiner quando necessário; não presumir que há Docker ou banco configurado. Não substituir testes de integração por mocks sem explicar cobertura.
5. **Sem custos:** proibir provisionamento AWS, deploy, serviços pagos, recursos de terceiros e publicação nas lojas sem aprovação explícita. Evitar qualquer dependência de credenciais reais.
6. **Critério de PR:** evidenciar validações realizadas; se ambiente impedir verificações essenciais, deixar PR em draft e declarar o que falta. Nunca afirmar que Android/iOS foram testados sem executar.
7. **Futuro AWS:** somente após MVP e testes locais suficientes, preparar proposta de arquitetura, custos estimados, limites, observabilidade e estratégia de desligamento para aprovação humana.

## Qualidade transversal

- Corrigir bugs bloqueantes, falhas de segurança e regressões que impeçam a entrega atual.
- Executar typecheck, testes e builds relevantes; documentar comandos e resultados.
- Não adicionar dependências, serviços pagos, credenciais ou infraestrutura sem aprovação.
- Evitar refatorações extensas sem necessidade demonstrada.

## Registro de decisões pendentes

1. Qual modelo de autenticação e papéis será adotado?
2. Quais regras definem um sorteio equilibrado?
3. Qual será o fluxo autorizado de convite/confirmação via WhatsApp?
4. Qual será a fonte de verdade dos dados (localStorage, API, banco) para o MVP?

## Como atualizar

Ao iniciar: marcar **IN PROGRESS** e referenciar o PR. Ao encontrar dependência: **BLOCKED** e registrar a decisão. Após merge em develop e validação: **DONE**. Evitar atualizações diretas em develop.
