# 🐳 Runbook Operacional: Docker & PostgreSQL 16

Guia de comandos e rotinas para gerenciar o ambiente de banco de dados do Alaska Local.

---

## 🚀 Comandos Principais (na raiz do Monorepo)

* **Subir o banco de dados**: `pnpm db:up` *(ou `docker compose up -d postgres`)*
* **Parar o banco de dados**: `pnpm db:down` *(ou `docker compose down`)*
* **Popular/Sincronizar estabelecimentos**: `pnpm db:seed`
* **Ver logs do PostgreSQL**: `docker compose logs -f postgres`
* **Acessar o terminal interativo do PostgreSQL**:
  ```bash
  docker exec -it alaska_postgres psql -U alaska_admin -d alaska_local_db
  ```

---

## 🛡️ Credenciais Padrão (Ambiente Local)

* **Usuário**: `alaska_admin`
* **Senha**: `alaska_secret_2026`
* **Banco**: `alaska_local_db`
* **Porta**: `5432`
* **URL**: `postgres://alaska_admin:alaska_secret_2026@localhost:5432/alaska_local_db`
