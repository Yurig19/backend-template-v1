# 🚀 Template Backend API

Este projeto é um **template de back-end** desenvolvido em **NestJS** com integração ao **PostgreSQL** e **Prisma ORM**, documentação via **Swagger** e **Redoc**, testes com **Jest** e suporte a execução via **Docker**.

---

## 📌 Tecnologias Utilizadas
- **[NestJS](https://nestjs.com/)** – Framework Node.js para construção de APIs escaláveis.
- **[Prisma](https://www.prisma.io/)** – ORM moderno para Node.js e TypeScript.
- **[Swagger](https://swagger.io/)** – Documentação interativa da API.
- **[Redoc](https://redoc.ly/)** – Documentação estática da API.
- **[PostgreSQL](https://www.postgresql.org/)** – Banco de dados relacional.
- **[Jest](https://jestjs.io/)** – Framework de testes.
- **Docker & Docker Compose** – Containerização e orquestração.

---

## 📂 Estrutura de Pastas

```
.
├── prisma/                     # Esquema do Prisma e migrações do banco de dados
├── src/
│   ├── core/                    # Núcleo da aplicação (compartilhado entre módulos)
│   │   ├── decorators/          # Decorators personalizados
│   │   ├── dtos/                 # DTOs universais usados por todo o projeto
│   │   ├── exceptions/          # Classes para tratamento de erros
│   │   ├── interceptors/        # Interceptadores globais
│   │   ├── filters/             # Filtros de exceção (Exception Filters)
│   │   ├── pipes/                # Pipes globais
│   │   └── utils/               # Funções utilitárias
│   │
│   └── modules/                 # Módulos de cada entidade
│       └── <entidade>/          # Exemplo: user, product, order, etc.
│           ├── controllers/     # Controladores HTTP (rotas)
│           ├── services/        # Serviços com regras de negócio
│           ├── use-cases/       # Casos de uso
│           │   ├── commands/    # Comandos (ações que modificam estado)
│           │   └── queries/     # Consultas (ações que leem dados)
│           ├── dtos/            # DTOs específicos da entidade
│           └── entities/        # Modelos ou classes da entidade
│
├── test/                        # Testes unitários e de integração (Jest)
├── docker-compose.yml           # Configuração Docker
├── package.json
└── README.md
```

---

## ⚙️ Exemplo de `.env`

```env
NODE_ENV="development"
# NODE_ENV="production"
# NODE_ENV="test"
# NODE_ENV="homologation"

PORT="8080"
API_VERSION="v1"

FRONTEND_URL="http://localhost:5173"

DB_USER="admin"
DB_PASSWORD="admin"
DB_PORT="5433"
DB_NAME="template_test"
DB_HOST="localhost"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

ADMIN_NAME="admin"
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="Teste@123"

JWT_SECRET="ee8184f1c73ee6e4b07ac4f3c0cf96c8554f06733fc8105867bcdd758b876f"
CRYPTO_SECRET_KEY="a91f3464d74ed76e542b909f777bf11366eb7ba7e1898e49aef9b282376958"
```

---

## 🐳 Executando com Docker

```bash
docker compose up -d
```

- PostgreSQL na porta `5434`
- API na porta `8081` (internamente `8080`)

Rodar migrações do Prisma:
```bash
docker exec -it template-backend pnpm prisma migrate deploy
```

Parar os containers:
```bash
docker compose down
```

Acompanhar logs:
```bash
docker compose logs -f
```

---

## 📜 Documentação da API

| Tipo | URL |
|------|-----|
| **Swagger UI** | `http://localhost:8081/api/v1/docs` |
| **Swagger JSON** | `http://localhost:8081/swagger.json` |
| **Redoc** | `http://localhost:8081/api/v1/redoc` |

---

## 🧪 Rodando os Testes

```bash
pnpm install
pnpm run test
pnpm run test:cov
```

---

## 📦 Build Manual (sem Docker)

```bash
pnpm install
pnpm run build
pnpm run start
```

Para aplicar migrações:
```bash
pnpm prisma migrate dev
```

---

## 📄 Licença
Este projeto é um template livre para uso e modificação.
