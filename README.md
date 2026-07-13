# my-hono-project

Boilerplate para APIs REST em **TypeScript + Hono**, rodando em Node.js com Prisma, autenticação JWT, fila de eventos via RabbitMQ, cache com Redis e upload de arquivos com S3/MinIO.

## Stack

- **Runtime**: Node.js 22+
- **Framework**: [Hono](https://hono.dev)
- **Linguagem**: TypeScript (CommonJS, compilado com `tsc` puro — sem bundler)
- **ORM**: Prisma + PostgreSQL
- **Injeção de dependência**: tsyringe
- **Validação**: Zod + class-validator/class-transformer (DTOs)
- **Autenticação**: JWT (access + refresh token)
- **Cache**: Redis (via `cache-manager` + `@keyv/redis`)
- **Mensageria**: RabbitMQ (event bus com consumers)
- **Storage**: S3-compatible (MinIO em desenvolvimento)

## Estrutura do projeto

```
src/
├── app/
│   ├── consumers/       # Consumers do event bus (ex.: user-created, blog-created)
│   ├── controllers/     # Controllers HTTP
│   ├── dto/             # DTOs de entrada validados por rota
│   ├── entities/        # Entidades de domínio/eventos
│   ├── errors/          # Erros HTTP customizados
│   ├── middlewares/     # Middlewares (auth, validate-dto)
│   ├── providers/       # Integrações (Prisma, JWT, Redis, RabbitMQ, S3, event-bus)
│   └── services/        # Regras de negócio
├── routes/              # Definição das rotas Hono por recurso
└── index.ts             # Bootstrap da aplicação e do event bus

prisma/
└── schema.prisma        # Modelos: User, Resource, Blog, Event

infra/
├── docker-compose.yaml      # Stack completa (app + postgres + redis + rabbitmq + minio)
├── docker-compose.dev.yaml  # Apenas dependências, para rodar a app localmente
└── Dockerfile
```

## Pré-requisitos

- Node.js 22+
- Yarn (o projeto usa **somente yarn**, não usar `npm`)
- Docker + Docker Compose

## Como rodar

### 1. Instalar dependências

```bash
yarn install
```

### 2. Configurar variáveis de ambiente

Copie `.env.dev` para `.env` e ajuste conforme necessário:

```bash
cp .env.dev .env
```

### 3. Subir as dependências (Postgres, Redis, RabbitMQ, MinIO)

```bash
make up-dev
```

### 4. Rodar as migrations do Prisma

```bash
yarn prisma migrate dev
```

### 5. Subir a aplicação em modo dev

```bash
yarn dev
```

A API sobe em `http://localhost:3000`.

## Scripts

| Script      | Comando                  | Descrição                             |
| ----------- | ------------------------ | -------------------------------------- |
| `dev`       | `tsx watch src/index.ts` | Sobe a aplicação em modo watch         |
| `typecheck` | `tsc --noEmit`           | Verifica os tipos sem gerar output     |
| `build`     | `tsc`                    | Compila o projeto para `dist/`         |
| `start`     | `node dist/index.js`     | Roda o build de produção               |

## Comandos Docker (Makefile)

| Comando                        | Descrição                                                |
| ------------------------------- | --------------------------------------------------------- |
| `make up-dev`                   | Sobe apenas as dependências (Postgres, Redis, RabbitMQ, MinIO) |
| `make down-dev`                 | Derruba as dependências                                    |
| `make docker-build-and-up`      | Builda e sobe a stack completa (app incluída)              |
| `make docker-re-build-and-up`   | Derruba, rebuilda e sobe a stack completa novamente        |

## Recursos incluídos

- **Auth**: `POST /auth/login`, `POST /auth/refresh-token`, `POST /auth/logout` (JWT com access + refresh token)
  - Access token de vida curta (`JWT_EXPIRATION_TIME`, padrão `15m`) + refresh token de vida longa (`REFRESH_TOKEN_EXPIRATION_TIME`, padrão `30d`), com secrets distintos (`JWT_SECRET` / `REFRESH_TOKEN_SECRET`)
  - Refresh token rotativo: a cada `/auth/refresh-token`, o token antigo é invalidado e um novo par é emitido; o hash do refresh token salvo no banco é comparado com `timingSafeEqual`
  - `/auth/logout` revoga o refresh token do usuário no banco
- **Users**: `POST /user` (cadastro, público), `GET /user` (listagem, protegido por `authMiddleware`)
- **Blog**: CRUD completo em `/blog` (protegido por `authMiddleware`)
- **Resource**: `POST /resource`, `GET /resource/:id`, `DELETE /resource/:id` (upload/gestão de arquivos via S3, protegido por `authMiddleware`)
- **Event bus**: publicação/consumo de eventos (`user-created`, `blog-created`) via RabbitMQ, com registro de status em `Event` (Postgres)
  - Status possíveis: `PENDING`, `PUBLISHED`, `PROCESSING`, `PROCESSED`, `FAILED_PUBLISH`, `FAILED_PROCESSING`, `DEAD_LETTER`
  - **Retry automático com backoff**: job em background (intervalo via `EVENT_RETRY_INTERVAL_MS`, padrão `60000`) reprocessa eventos `FAILED_PUBLISH`/`FAILED_PROCESSING` elegíveis, com backoff exponencial (30s até um teto de 30min) e limite de 5 tentativas — após isso o evento vira `DEAD_LETTER`
  - **Replay manual** (rotas protegidas por `authMiddleware`):
    - `GET /events?status=<status>` — lista eventos, opcionalmente filtrando por status
    - `POST /events/replay-failed` — dispara a varredura de retry sob demanda
    - `POST /events/:id/replay` — reenvia um evento específico para a fila, zerando tentativas (útil para tirar um evento de `DEAD_LETTER`)

## Convenções de código
- Gerenciador de pacotes: **yarn** apenas.
