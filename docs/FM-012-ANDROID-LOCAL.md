# FM-012 — Preparação e validação Android local

**Escopo:** roteiro reproduzível para preparar o projeto Flutter para Android, sem publicar aplicativo, criar infraestrutura ou modificar o código de negócio.

## Evidência na branch develop (2026-11-04)

- `flutter_app/pubspec.yaml` declara Flutter, Dart >=3.3.0 <4.0.0 e dependências `shared_preferences`, `cupertino_icons`, `flutter_test` e `flutter_lints`.
- A auditoria FM-011 em `docs/FM-011-AUDITORIA-FLUTTER.md` registra ausência de `flutter_app/android/` versionado e testes Flutter.
- Nesta execução (ambiente Linux), `command -v flutter`, `command -v dart`, `command -v adb` e `command -v sdkmanager` não retornaram executáveis; `java` está disponível.
- **Não houve geração de projeto nativo, resolução de dependências, análise, testes ou build.** A compilação e o funcionamento no Android permanecem **não verificados**.

## Procedimento em máquina de desenvolvimento equipada

Pré-requisitos: Flutter SDK compatível com o projeto, Android SDK com platform/build tools, licenças aceitas, JDK compatível com o Gradle gerado, dispositivo ou emulador configurado. Não usar chaves de assinatura nem credenciais de produção.

A partir de um clone limpo e de uma **branch própria derivada de develop**, executar:

```bash
flutter --version
dart --version
flutter doctor -v
cd flutter_app
flutter pub get
flutter analyze
flutter test
```

Se `android/` continuar ausente, **não executar `flutter create .` diretamente em develop**. Na branch de trabalho, fazer cópia/commit de segurança e gerar somente o alvo Android:

```bash
flutter create --platforms=android .
git status --short
git diff --check
```

Revisar os arquivos gerados, identificador do pacote, `minSdk`, permissões, versões do Gradle/AGP e alterações inesperadas antes de propor seu versionamento. Evitar sobrescrever arquivos de negócio e não adicionar chaves, `local.properties` ou dados específicos da máquina.

Com o Android SDK instalado e configurado:

```bash
flutter doctor -v
flutter devices
flutter build apk --debug
```

Em dispositivo/emulador local disponível, realizar smoke test manual: iniciar o app, navegar pelas cinco abas, criar/editar jogador e time, marcar presença, sortear equipes, registrar partida, abrir rankings, fechar/reabrir e conferir persistência. Usar somente dados fictícios. Registrar versão Flutter/Dart, Android SDK, dispositivo, comandos, saídas e falhas reais.

## Critérios para concluir FM-012

1. Estrutura Android revisada e versionada em PR específico, sem credenciais ou arquivos locais.
2. `flutter pub get`, `flutter analyze`, `flutter test` e `flutter build apk --debug` executados com resultados documentados (criar testes antes de considerar `flutter test` como cobertura suficiente).
3. Smoke test local em Android registrado; falhas corrigidas ou explicitamente rastreadas.
4. Revisão humana e merge em `develop`; somente então marcar FM-012 como DONE.

**Pendência:** ambiente com Flutter + Android SDK e decisão/revisão dos arquivos nativos gerados. Este documento não comprova que o Android está pronto.
