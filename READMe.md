# Ecommerce API (Node.js + Express + Prisma + PostgreSQL)

Ushbu loyiha — e-commerce uchun REST API. Unda:
- Auth: register/login/JWT
- Products CRUD (ADMIN)
- Cart (savatcha)
- Orders / Checkout (transaction bilan)
- Swagger/OpenAPI docs: `/docs`

## Texnologiyalar
- Node.js + Express
- Prisma ORM
- PostgreSQL (Neon kabi cloud DB ham bo‘ladi)
- JWT (access/refresh)
- Zod (validation)
- Swagger UI (OpenAPI 3)

---

## 1) O‘rnatish

### Talablar
- Node.js (tavsiya: Node 20 LTS)
- PostgreSQL (lokal yoki cloud: Neon/Supabase)

### Repo clone va paketlar
```bash
git clone <REPO_URL>
cd ecommerce-api
npm install
