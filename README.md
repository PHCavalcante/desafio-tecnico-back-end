# Desafio Técnico Back-end

API REST para gerenciamento de pedidos (orders) com autenticação JWT e banco de dados MongoDB.

## Tecnologias

- Node.js
- TypeScript
- Express.js
- MongoDB (MongoMemoryServer para testes e setup rapido)
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Vitest (testes)

## Pré-requisitos

- Node.js
- npm ou yarn ou pnpm

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/PHCavalcante/desafio-tecnico-back-end.git
cd desafio-tecnico-back-end
```

2. Instale as dependências:
```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```env
PORT=3000
JWT_SECRET=seu_secret_jwt_aqui
JWT_EXPIRE=7d
```

**Nota:** Se as variáveis de ambiente não forem definidas, o sistema usará valores padrão:
- `PORT`: 3000
- `JWT_SECRET`: "default_secret" (não recomendado para produção)
- `JWT_EXPIRE`: "7d"

## Execução

### Modo Desenvolvimento

Executa o servidor com hot-reload:
```bash
npm run dev
```

### Modo Produção

1. Verifique os tipos TypeScript:
```bash
npm run build
```

2. Inicie o servidor:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000` (ou na porta definida em `PORT`).

## Testes

Execute os testes unitários:
```bash
npm test
```

## Estrutura do Projeto

```
desafio-back-end/
├── src/
│   ├── app.ts                 # Configuração do Express
│   ├── controllers/           # Controllers das rotas
│   │   └── controllers.ts
│   ├── database/              # Configuração do banco de dados
│   │   └── db.ts
│   ├── middleware/            # Middlewares
│   │   └── auth.ts            # Autenticação JWT
│   ├── models/                # Lógica de negócio
│   │   └── models.ts
│   ├── mongoose/              # Schemas do Mongoose
│   │   └── schemas.ts
│   ├── routes/                # Definição das rotas
│   │   └── routes.ts
│   ├── types/                 # Definições de tipos TypeScript
│   │   ├── express/
│   │   └── types.ts
│   ├── utils/                 # Funções utilitárias
│   │   └── advanceOrderState.ts
│   └── tests/                 # Testes unitários
│       └── order.spec.ts
├── index.ts                   # Ponto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

## Endpoints da API

### Autenticação

#### POST /register
Registra um novo usuário.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta de sucesso (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_aqui"
}
```

#### POST /login
Autentica um usuário e retorna um token JWT.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta de sucesso (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_aqui"
}
```

### Pedidos (Orders)

Todas as rotas de pedidos requerem autenticação via Bearer Token no header:
```
Authorization: Bearer <token>
```

#### GET /orders
Lista pedidos com paginação.

**Query Parameters:**
- `state` (obrigatório): Estado do pedido ("CREATED", "ANALYSIS", "COMPLETED")
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 100)

**Exemplo:**
```
GET /orders?state=CREATED&page=1&limit=10
```

**Resposta de sucesso (200):**
```json
{
  "orders": [...],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

#### POST /orders
Cria um novo pedido.

**Body:**
```json
{
  "lab": "Laboratório A",
  "patient": "Paciente X",
  "customer": "Cliente Y",
  "services": [
    {
      "name": "Exame 1",
      "value": 100.50,
      "status": "PENDING"
    }
  ]
}
```

**Resposta de sucesso (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {...}
}
```

#### PATCH /orders/:id/advance
Avança o estado de um pedido.

**Estados possíveis:**
- CREATED -> ANALYSIS
- ANALYSIS -> COMPLETED
- COMPLETED -> Erro (pedido já completado)

**Resposta de sucesso (200):**
```
Order state advanced successfully
```

**Respostas de erro:**
- 404: Order not found
- 400: Order is already completed

## Modelo de Dados

### Order
```typescript
{
  lab: string;
  patient: string;
  customer: string;
  state: "CREATED" | "ANALYSIS" | "COMPLETED";
  status: "ACTIVE" | "DELETED";
  services: {
    name: string;
    value: number;
    status: "PENDING" | "DONE";
  }[];
}
```

### User
```typescript
{
  email: string;
  password: string; // Hash bcrypt
}
```

## Segurança

- Senhas são hasheadas com bcrypt antes de serem armazenadas
- Autenticação via JWT (JSON Web Tokens)
- Tokens expiram em 7 dias (configurável via JWT_EXPIRE)
- Rotas protegidas requerem token válido no header Authorization