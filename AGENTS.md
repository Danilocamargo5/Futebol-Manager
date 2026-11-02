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

## Prioridade mobile e arquitetura alvo

- Priorizar inicialmente FM-011 a FM-015 de `docs/BACKLOG.md`, preservando correções bloqueantes de segurança e qualidade.
- Flutter em `flutter_app` é o aplicativo mobile principal para Android e iOS; usar base de código compartilhada e diferenças por plataforma somente quando necessárias.
- React será o painel web administrativo e a API será compartilhada. **Não** assumir que a integração já está implementada; mapear antes de mudar.
- Não criar dois aplicativos nativos independentes, reescrever o app ou alterar arquitetura de persistência sem proposta aprovada.

## Desenvolvimento local-first e custos

- **Proibido criar, modificar ou provisionar recursos AWS**, executar Terraform apply, deploy, serviços pagos ou publicar nas lojas sem autorização humana explícita.
- Priorizar testes automatizados e ambiente local com mocks, fixtures, emuladores e serviços locais quando disponíveis.
- Flutter: verificar SDK, depois `cd flutter_app && flutter pub get && flutter analyze && flutter test`. Não alegar testes executados se SDK ausente.
- Android: build/emulador só com SDK configurado. iOS: build e simulador exigem macOS com Xcode; se indisponíveis, registrar limitação.
- Para testes de integração, documentar o que foi real versus simulado. Nunca usar credenciais de produção.
- Antes de propor AWS, apresentar arquitetura, estimativa de custos, limites de orçamento, desligamento e alternativas locais para aprovação.

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
