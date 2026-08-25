# 🚀 Quick Start - Futebol-Manager

## Opção 1: Usando pnpm (Recomendado)

```bash
# Iniciar API + Pelada Pro em paralelo
pnpm start

# Mesmo que 'start'
pnpm dev

# Parar: Ctrl+C
```

## Opção 2: Usando script bash

```bash
# Iniciar
./dev.sh start

# Parar
./dev.sh stop

# Restart
./dev.sh restart

# Ver status
./dev.sh status

# Ver logs em tempo real
./dev.sh logs
```

## Endereços

| Serviço | URL | Porta |
|---------|-----|-------|
| API Server | http://localhost:8000 | 8000 |
| Pelada Pro | http://localhost:5173 | 5173 |

## Desenvolvimento Individual

Se quiser rodar apenas um servidor:

```bash
# Apenas API
cd artifacts/api-server
PORT=8000 pnpm dev

# Apenas Pelada Pro
cd artifacts/pelada-pro
PORT=5173 pnpm dev
```

## Codespaces

No Codespaces, tudo já vem pré-instalado graças ao `.devcontainer/devcontainer.json`:

```bash
pnpm start
# ou
./dev.sh start
```

Pronto! 🎉
