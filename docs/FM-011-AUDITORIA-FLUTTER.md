# FM-011 — Auditoria estática do aplicativo Flutter

**Data:** 2026-11-03  
**Base inspecionada:** `develop` @ `a1624c3a53b9ccb6e3fdc03c72ac57c44540ddc1`  
**Escopo:** leitura de código e estrutura; nenhuma funcionalidade foi modificada.  
**Status:** auditoria estática concluída; validação de execução pendente por falta do SDK Flutter/Dart neste ambiente.

## Evidências e funcionalidades existentes

| Área | Evidência no repositório | Estado observado |
| --- | --- | --- |
| Navegação mobile | `flutter_app/lib/main.dart` (`HomeShell`) | Cinco abas: Início, Jogadores, Times, Sorteio e Rankings. |
| Jogadores | `PlayersScreen`, `showPlayerEditor` e `AppState.addPlayer/updatePlayer/removePlayer` | Listagem, busca, inclusão, edição, exclusão, notas por posição e presença manual. |
| Times fixos | `TeamsScreen`, `showTeamEditor` e métodos de `AppState` | Inclusão, edição e exclusão; remover time desvincula jogadores. |
| Sorteio | `DrawScreen` e `AppState.drawTeams` | Divide jogadores marcados como presentes em duas equipes após ordenar por média de avaliações. É determinístico, não aleatório. |
| Registro de resultado | `showMatchEditor`, `AppState.addMatch` e `MatchRecord` | Placar, gols individuais, destaque de goleiro e data do registro. |
| Rankings | `RankingsScreen` e métodos `rankingByGoals/rankingByGoalkeeper` | Artilharia e prêmios de goleiro com filtros Semana, Mês e Ano. |
| Estado e persistência | `flutter_app/lib/app_state.dart` | `ChangeNotifier` e `shared_preferences`, com JSON local para times, jogadores e partidas; dados demonstrativos na primeira abertura. |
| Modelos | `flutter_app/lib/models.dart` | `Team`, `Player`, `MatchRecord`, `PlayerPosition` e serialização JSON. |

**Dependências declaradas:** Flutter SDK, `cupertino_icons: ^1.0.8`, `shared_preferences: ^2.5.3`; em desenvolvimento, `flutter_test` e `flutter_lints: ^5.0.0` (`flutter_app/pubspec.yaml`). Requisito Dart: `>=3.3.0 <4.0.0`.

## Lacunas verificadas e riscos

1. **Sem sincronização Flutter ↔ API:** não há cliente HTTP nem chamada de API no código Flutter inspecionado. `lib/api-spec/openapi.yaml` descreve apenas `GET /healthz`, implementado na API Express. A aplicação React utiliza armazenamento no navegador em parte de seus fluxos; não há fonte de dados compartilhada comprovada. **A decisão de integração permanece FM-014 (BLOCKED)**.
2. **Sem pastas nativas versionadas:** não existem `flutter_app/android/` ou `flutter_app/ios/` na árvore de `develop`. O README Flutter instrui `flutter create .`, mas a geração e os builds ainda precisam ser verificados em ambiente adequado (FM-012 e FM-013).
3. **Sem testes Flutter versionados:** não existe `flutter_app/test/` na árvore inspecionada, embora `flutter_test` esteja declarado. Falta cobertura automatizada de serialização, persistência, sorteio e rankings.
4. **Persistência local e recuperação:** `AppState.load()` faz `jsonDecode` e casts sem tratamento explícito de dados corrompidos. Um JSON inválido pode impedir a conclusão da inicialização. Dados locais não oferecem, por si só, sincronização ou backup entre aparelhos.
5. **Validações de domínio:** o formulário de partida usa `int.tryParse(...) ?? 0`, sem rejeição explícita de placares negativos ou conferência entre gols individuais e placar. Os métodos de inclusão de jogadores não verificam nomes duplicados. Esses pontos são riscos identificados por leitura, **não bugs reproduzidos em execução**.
6. **Escopo de produto não implementado no Flutter inspecionado:** não foram identificados login/papéis, criação/agendamento de rodadas, convites remotos ou confirmação remota de presença. Há apenas o indicador local de presença. Não iniciar essas funcionalidades sem consultar as decisões pendentes no backlog.
7. **Manutenção:** a interface está concentrada em `flutter_app/lib/main.dart` (aproximadamente 911 linhas); considerar modularização incremental somente quando houver testes e necessidade concreta.

## Validações realizadas e limitações

| Verificação | Resultado |
| --- | --- |
| Acesso a `develop`, leitura de `AGENTS.md`, `docs/BACKLOG.md`, árvore e código | **OK**, via integração GitHub |
| Consulta de issues e PRs abertos | **OK**: nenhum aberto no momento da auditoria |
| Presença do executável `flutter` e `dart` neste ambiente | **Ausentes** (`command -v flutter` e `command -v dart`) |
| `cd flutter_app && flutter pub get` | **Não executado**: Flutter indisponível |
| `cd flutter_app && flutter analyze` | **Não executado**: Flutter indisponível |
| `cd flutter_app && flutter test` | **Não executado**: Flutter indisponível; não há testes versionados |
| Build Android / iOS, simulador, smoke test | **Não executados**: SDKs e pastas nativas indisponíveis; iOS exige macOS/Xcode |
| Testes API/React | **Não executados**: auditoria documental sem alterações nesses projetos |

Não há evidência de execução do aplicativo nesta auditoria. O relatório não atesta que o Flutter compila nem que os fluxos funcionam em dispositivo.

## Próximas etapas recomendadas (sem alterar arquitetura)

1. **FM-011 — completar a validação dinâmica** em Codespace ou máquina com Flutter instalado: `flutter --version`, `cd flutter_app && flutter pub get && flutter analyze && flutter test`. Registrar saídas reais e corrigir eventuais falhas em PR separado.
2. **FM-012 / FM-013:** avaliar `flutter create .` em branch própria, revisar arquivos gerados antes de versionar, testar Android somente com Android SDK e iOS somente em macOS/Xcode.
3. **FM-015:** criar testes locais com `flutter_test` e `SharedPreferences.setMockInitialValues` para serialização, persistência e sorteio; manter dados fictícios.
4. **FM-014:** mapear contratos de jogadores, rodadas e partidas e propor autenticação, autorização, sincronização e fonte de verdade para aprovação humana **antes** de implementar comunicação com a API.

**Conclusão:** o Flutter já contém um protótipo funcional em código para gestão local de jogadores, times, sorteio, partidas e rankings. A existência de código não substitui validação em runtime. Manter este PR como **draft** até que a validação Flutter seja realizada ou o responsável humano aceite explicitamente o relatório estático como entrega documental.
