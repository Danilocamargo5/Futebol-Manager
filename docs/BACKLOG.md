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
