# ⚽ Futebol-Manager (Pelada Pro)

App para controle de partidas de futebol amador, jogadores, sorteios e rankings.

**Status:** Em desenvolvimento 🚀

---

## 📋 Estrutura do Projeto

```
Futebol-Manager/
├── 📱 flutter_app/           # App mobile (Flutter/Dart)
├── 🖥️ artifacts/
│   ├── api-server/           # API Node.js/Express + TypeScript
│   ├── pelada-pro/           # Web app (React + Vite + Tailwind)
│   └── mockup-sandbox/       # Prototipagem
├── 📚 lib/                   # Bibliotecas compartilhadas
│   ├── api-zod/              # Validação de tipos com Zod
│   ├── api-client-react/     # Cliente HTTP para React
│   ├── api-spec/             # Especificação OpenAPI
│   └── db/                   # Database schema (Drizzle ORM)
└── 📋 scripts/               # Scripts de build e automação
```

---

## 🚀 Quick Start - Desenvolvimento Local

### Pré-requisitos
- **Node.js** >= 18
- **pnpm** (gerenciador de pacotes)

### Instalação

```bash
# 1. Instalar pnpm (se não tiver)
npm install -g pnpm

# 2. Instalar dependências
pnpm install

# 3. Compilar bibliotecas compartilhadas
pnpm run build
```

### Executar em Desenvolvimento

#### Opção 1: Executar tudo junto (recomendado)

```bash
# API Server rodará na porta 3000
# React Web rodará na porta 5173
bash /home/claude/dev-start.sh
```

#### Opção 2: Executar separado

**Terminal 1 - API Server:**
```bash
cd artifacts/api-server
PORT=3000 pnpm dev
```

**Terminal 2 - React Web:**
```bash
cd artifacts/pelada-pro
pnpm dev
```

### Acessar os Aplicativos

- 🌐 **Web App:** http://localhost:5173
- 📡 **API Server:** http://localhost:3000
- 🏥 **Health Check:** http://localhost:3000/health

---

## 🛠️ Desenvolvimento

### Stack Tecnológico

#### Backend
- **Framework:** Express.js 5.2.1
- **Linguagem:** TypeScript
- **ORM:** Drizzle ORM
- **Validação:** Zod
- **Logging:** Pino

#### Frontend (Web)
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Form:** React Hook Form
- **State:** TanStack Query
- **Routing:** Wouter

#### Mobile
- **Framework:** Flutter
- **Linguagem:** Dart
- **Storage:** Shared Preferences

### Estrutura de Commits

Use as seguintes prefixos nos commits:

- `feat:` - Nova feature
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação (sem mudanças de código)
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas administrativas

**Exemplo:**
```bash
git commit -m "feat: adicionar sorteio automático de times"
```

---

## 📝 Features Planejadas

- [ ] Criar partidas
- [ ] Gerenciar jogadores
- [ ] Sistema de pontuação e ranking
- [ ] Sorteio automático de times
- [ ] Histórico de partidas
- [ ] Estatísticas dos jogadores
- [ ] Notificações
- [ ] Dark mode
- [ ] Sincronização offline

---

## 🔗 GitHub

**Repositório:** https://github.com/Danilocamargo5/Futebol-Manager

**Clonar:**
```bash
git clone https://github.com/Danilocamargo5/Futebol-Manager.git
cd Futebol-Manager
pnpm install
```

---

## 📞 Suporte

Para reportar bugs ou sugerir features, abra uma issue no GitHub.

---

## 📄 License

MIT
