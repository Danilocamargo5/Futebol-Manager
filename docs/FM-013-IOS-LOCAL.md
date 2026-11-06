# FM-013 — Preparação e validação iOS local

**Data:** 2026-11-05  
**Escopo:** auditoria estática e roteiro local, sem alterar código de negócio ou infraestrutura.

## Evidências em `develop`

- `flutter_app/pubspec.yaml` define Dart `>=3.3.0 <4.0.0`, Flutter e `shared_preferences`.
- `flutter_app/lib/main.dart` inicializa `AppState` e oferece cinco abas: Início, Jogadores, Times, Sorteio e Rankings.
- A auditoria FM-011 registra que `flutter_app/ios/` não está versionado; tentativa de leitura de `flutter_app/ios/Runner/Info.plist` nesta execução não encontrou o arquivo.
- A execução atual é em Linux. Verificações de executáveis não encontraram `flutter`, `dart`, `xcodebuild` nem `pod`. **Não foram executados** análise Dart, testes Flutter, geração do projeto iOS, build ou simulador.

## Roteiro em macOS com Xcode

Em uma branch de trabalho criada a partir de `develop`, em um Mac com Flutter, Xcode, ferramentas de linha de comando e simulador iOS instalados:

```bash
flutter --version
xcodebuild -version
flutter doctor -v
cd flutter_app
flutter pub get
flutter analyze
flutter test
```

Se `ios/` estiver ausente, gerar **somente** a plataforma iOS na branch, após conferir que o diretório de trabalho está limpo:

```bash
flutter create --platforms=ios .
git status --short
git diff --check
```

Revisar os arquivos nativos gerados antes de commit: identificador do bundle, versão mínima do iOS, permissões no `Info.plist`, configurações de assinatura e alterações não intencionais. Não adicionar certificados, perfis, tokens ou dados específicos da máquina.

Com o simulador instalado e disponível, executar:

```bash
flutter devices
flutter build ios --simulator --debug
flutter run -d <ID_DO_SIMULADOR>
```

Substituir `<ID_DO_SIMULADOR>` pelo identificador retornado por `flutter devices`. Registrar versões, comandos, saídas e eventuais erros. O build de simulador não comprova assinatura ou distribuição em dispositivo físico; não publicar em loja.

## Smoke test manual (dados fictícios)

Verificar navegação entre as cinco abas; inclusão e edição de jogador e time; marcação de presença; sorteio; registro de partida; rankings; encerramento e reabertura do aplicativo para conferir persistência local. Testar também inicialização limpa. Anotar falhas e passos para reprodução.

## Critérios de conclusão

1. Estrutura `ios/` gerada e revisada em PR próprio, sem segredos ou arquivos locais.
2. `flutter pub get`, `flutter analyze`, `flutter test` e build de simulador executados com resultados documentados em macOS/Xcode.
3. Smoke test no simulador documentado, com problemas rastreados.
4. Revisão humana e merge em `develop`; marcar DONE somente após integração e validação.

**Status:** preparação documental concluída; geração iOS, build, testes e smoke test pendentes. Este documento não afirma compatibilidade iOS validada.
