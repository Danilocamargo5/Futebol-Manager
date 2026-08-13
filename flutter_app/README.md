# Pelada Pro

Aplicativo Flutter para organizar futebol amador:

- Cadastro de times e jogadores.
- Avaliação de cada jogador por posição, com estrelas de 0 a 3.
- Sorteio equilibrado de duas equipes a partir dos jogadores presentes.
- Registro de placar, gols por jogador e melhor goleiro.
- Rankings de artilheiros e melhores goleiros da semana, mês e ano.
- Persistência local com `shared_preferences`, sem necessidade de servidor.

## Como executar

1. Instale o Flutter stable pelo guia oficial: <https://docs.flutter.dev/get-started/install>.
2. Abra a pasta `flutter_app` no Android Studio ou VS Code.
3. Gere as pastas nativas do projeto uma vez:

```bash
flutter create .
```

4. Instale as dependências e execute:

```bash
flutter pub get
flutter run
```

Para gerar os pacotes:

```bash
flutter build apk --release
flutter build ipa --release
```

O aplicativo inicia com dados demonstrativos para que o fluxo possa ser experimentado. Esses dados podem ser excluídos ou editados na tela de jogadores.