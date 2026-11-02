# Instruções para agentes — Futebol-Manager

Este arquivo estabelece regras de trabalho no repositório. Consulte também [docs/BACKLOG.md](docs/BACKLOG.md).

## Fluxo Git obrigatório

1. **Sempre partir da branch `develop` atualizada.**
2. Criar branch curta `feature/*`, `fix/*`, `test/*` ou `docs/*` por tarefa.
3. Abrir PR **exclusivamente para `develop`**. Nunca direcionar PR para `main`.
4. **Nunca realizar merge, deploy, push direto em `develop` ou `main`**, nem alterar regras de proteção das branches.
5. Antes de abrir PR, confirmar explicitamente a branch base. Não duplicar PRs existentes.
6. O responsável humano revisa e decide sobre merge.

## Seleção de trabalho

- Consultar `docs/BACKLOG.md` e escolher a tarefa de maior prioridade ainda pendente, sem PR aberto e com escopo pequeno.
- Verificar código, README, issues e PRs antes de declarar que uma funcionalidade não existe. O backlog começa com estados a validar.
- Trabalhar em **uma entrega por execução**; evitar correções aleatórias que não contribuam para o backlog ou a segurança da entrega.
- Se houver decisões de produto, integrações externas, custos, infraestrutura, privacidade ou mudanças destrutivas, propor e aguardar aprovação.
- Preservar funcionalidades existentes; não introduzir dependências externas sem justificativa e aprovação.

## Qualidade e validação

- Manter o stack e os padrões existentes (workspace pnpm, API TypeScript/Express, frontend React; Flutter opcional conforme escopo).
- Instalar dependências respeitando o lockfile e as políticas de segurança existentes.
- Executar testes, typechecks e builds pertinentes. Comandos úteis na raiz:
  - `pnpm run typecheck:libs`
  - `pnpm run typecheck`
  - `pnpm --filter @workspace/api-server build`
  - `pnpm --filter @workspace/pelada-pro build`
- Se comandos ou nomes de pacotes mudarem, verificar o `package.json` real.
- Não desabilitar verificações nem alterar código apenas para ocultar falhas.
- Se dependências ou ambiente impedirem validação, registrar o impedimento e manter PR como **draft**.

## Segurança e dados

- Nunca revelar, alterar ou registrar segredos e credenciais.
- Validar entradas, autorização e operações repetidas; considerar idempotência e retries.
- Não executar alterações destrutivas ou integrações pagas sem autorização.
- Não enviar mensagens reais a jogadores nem integrar WhatsApp sem consentimento e definição de requisitos.

## Entrega e comunicação

Todo PR deve conter:
- ID do backlog, objetivo e justificativa;
- descrição do que mudou e arquivos principais;
- testes executados, resultados e limitações;
- riscos, decisões pendentes e próximos passos;
- confirmação de destino: **`develop`**.

Se não houver uma tarefa segura e claramente definida, apresentar proposta sem modificar código.
