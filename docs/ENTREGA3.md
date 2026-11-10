# Entrega 3 — CRUD completo, integração e permissões

## O que foi implementado

| Requisito da Entrega 3 | Onde está |
|---|---|
| CRUD completo (POST, GET, PUT, DELETE) | `transacoes` (principal), `metas`, `categorias` (admin), `limites` |
| Interface HTML/CSS/JS | `frontend/pages/painel.html`, `frontend/css/style.css` |
| DOM + Fetch | `frontend/js/api.js` (função `api`) e `frontend/js/painel.js` |
| Integração front + API + MySQL | Painel consome `/api/...`, controllers gravam no MySQL |
| Permissões na API | `middlewares/auth.js`, `middlewares/autorizar.js` e `WHERE usuario_id` nos controllers |
| Validações e regras de negócio | `controllers/*.js` e `utils/validacoes.js` |

## Como testar (roteiro de demonstração)

1. Rode `sql/schema.sql`, configure `backend/.env`, execute `npm install` e `npm run dev`.
2. Abra http://localhost:3000, crie duas contas (A e B).
3. Torne A administrador: `UPDATE usuarios SET perfil='admin' WHERE email='a@teste.com';` e faça login de novo.
4. Com A: crie transações (receita e despesa), edite, exclua; crie uma meta; defina um limite.
5. Veja o Resumo: despesas > receitas gera alerta; passar do limite gera aviso.
6. Com B (usuário comum): a aba Administração não aparece. Prove que a API também barra:
   - `GET /api/usuarios` com o token de B → **403**
   - `GET /api/transacoes/ID_DE_A` com o token de B → **404**
   - `PUT /api/transacoes/ID_DE_A` com o token de B → **404**
   - `POST /api/categorias` com o token de B → **403**
7. Testes de validação: valor negativo (400), data 2026-02-31 (400), categoria de receita numa despesa (400), meta com valor guardado maior que o valor da meta (400).

## Sugestão de commits

1. `Corrige schema.sql e adiciona utilitários de validação`
2. `Implementa CRUD de transações com regras de negócio e resumo mensal`
3. `Implementa CRUD de categorias (admin), metas e limites`
4. `Adiciona páginas de login, cadastro e API de fetch no frontend`
5. `Adiciona painel com CRUD de transações, metas, limites e administração`
6. `Atualiza README e documentação da Entrega 3`
