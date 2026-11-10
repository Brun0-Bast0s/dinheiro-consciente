# 💰 Dinheiro Consciente

> Plataforma web de educação financeira com ferramentas práticas de controle de gastos, metas e uma comunidade de aprendizado.

- **Autor:** Bruno da Silva Bastos
- **Curso/Disciplina:** Técnico — Projeto Web
- **Status:** 🚧 Entrega 3 — CRUD completo, integração e permissões

---

## 1. O problema

O endividamento é um dos maiores problemas financeiros das famílias brasileiras. Segundo a CNC, **80,4% das famílias estavam endividadas em março de 2026**, e dados da Serasa indicam que quase metade dos brasileiros tem dívidas em atraso, somando cerca de **R$ 500 bilhões**.

Uma das causas é a **falta de educação financeira**: muitas pessoas não aprendem na escola a montar um orçamento, separar necessidades de desejos, usar o crédito com disciplina ou formar uma reserva de emergência. Além disso:

- O conteúdo existente na internet é disperso, técnico demais e muitas vezes vem acompanhado de propaganda de produtos financeiros.
- Ferramentas de controle financeiro costumam ser complexas ou pagas.
- Golpes de "investimentos milagrosos" atingem justamente quem tem pouca informação.
- Quem está aprendendo não tem onde trocar experiências de forma segura e moderada.

### Público afetado
- Jovens recém-formados e estudantes que estão começando a lidar com o próprio dinheiro.
- Trabalhadores e famílias de renda média e baixa, que usam crédito (cartão, cheque especial, crediário) sem planejamento.
- Pessoas que querem sair do endividamento e não sabem por onde começar.

### Justificativa
Resolver o problema exige duas coisas juntas: **aprender** (conteúdo claro e confiável) e **praticar** (registrar os próprios gastos e acompanhar metas). Hoje essas duas partes ficam separadas. O Dinheiro Consciente une as duas em um só lugar, gratuito e simples. O projeto está alinhado ao **Objetivo de Desenvolvimento Sustentável 4 da ONU** (educação inclusiva e de qualidade) e às recomendações do Banco Central do Brasil e da ANBIMA sobre educação financeira.

---

## 2. Proposta de solução

Um sistema web em que o usuário **aprende** com trilhas e artigos curtos, **controla** suas receitas e despesas, **define metas** (como a reserva de emergência), recebe **alertas** quando seus gastos fogem do planejado e **troca experiências** em uma comunidade moderada.

### Objetivo geral
Desenvolver um sistema web simples e acessível que ajude pessoas a organizar suas finanças pessoais e a adquirir hábitos financeiros saudáveis, reduzindo o risco de endividamento.

### Objetivos específicos
- Oferecer conteúdos educativos claros sobre orçamento, economia doméstica, crédito, investimentos e golpes financeiros.
- Permitir o registro e o acompanhamento de receitas e despesas por categoria.
- Permitir a criação de metas financeiras com acompanhamento do progresso.
- Gerar alertas e indicadores a partir de regras de negócio (ex.: gastos acima da renda).
- Criar uma comunidade moderada de troca de dicas.
- Garantir segurança dos dados com autenticação e controle de permissões.

### Pilares
1. **Simplicidade** — linguagem clara e menus intuitivos.
2. **Acessibilidade** — design responsivo e uso no celular.
3. **Interatividade** — simuladores, gráficos, trilhas e comunidade.

---

## 3. Principais funcionalidades previstas

**Gerais**
- Cadastro, login e logout com autenticação por JWT.
- Painel (dashboard) com resumo financeiro do mês.

**Controle financeiro** *(entidade principal do CRUD)*
- CRUD de **transações** (receitas e despesas): valor, descrição, data, categoria e tipo.
- Categorias de gastos (moradia, alimentação, transporte, lazer, etc.).
- Resumo mensal: total de receitas, despesas e saldo.
- Alerta quando as despesas ultrapassam a renda do mês ou o limite de uma categoria.

**Metas**
- CRUD de **metas** financeiras (ex.: reserva de emergência, viagem, quitar dívida).
- Acompanhamento do progresso (valor guardado × valor desejado).

**Educação financeira**
- Trilhas e artigos organizados por categoria, com vídeos e infográficos.
- Simulador de orçamento (regra 50/30/20: necessidades, desejos e poupança).
- Seção "Alerta de golpes" sobre investimentos não confiáveis.

**Comunidade**
- Publicação de dúvidas e dicas (posts) e comentários.
- Moderação de conteúdo.

**Administração**
- Gerenciamento de usuários e perfis de acesso.
- Gerenciamento de categorias.

---

## 4. Tipos de usuários e ações previstas

| Perfil | Descrição | Ações |
|---|---|---|
| **Visitante** (sem login) | Quem acessa o site sem conta | Ver página inicial, ler conteúdos públicos, usar o simulador, cadastrar-se e fazer login |
| **Usuário** | Pessoa cadastrada | Tudo do visitante + gerenciar **suas** transações e metas, ver o painel, criar posts e comentários, editar/excluir **seus** posts e comentários |
| **Moderador/Educador** | Responsável pelo conteúdo | Tudo do usuário + criar, editar e excluir conteúdos educativos, ocultar/excluir posts e comentários inadequados |
| **Administrador** | Gestor do sistema | Tudo do moderador + gerenciar usuários (alterar perfil, desativar contas) e categorias |

> As permissões serão verificadas **na API** (middlewares de autenticação e autorização), e não apenas escondendo botões no front-end.

---

## 5. Regras de negócio previstas

1. Cada usuário só pode visualizar, editar e excluir **suas próprias** transações e metas.
2. O valor de uma transação deve ser maior que zero e ter tipo definido (receita ou despesa).
3. Se as despesas do mês ultrapassarem as receitas, o sistema exibe um alerta de risco de endividamento.
4. Se uma categoria tiver limite mensal e ele for ultrapassado, o sistema emite um aviso.
5. O progresso de uma meta é calculado em porcentagem (valor guardado ÷ valor da meta) e não pode passar de 100%.
6. Somente moderadores e administradores publicam conteúdos educativos.
7. Somente administradores alteram perfis de acesso.
8. Senhas são armazenadas com hash e e-mails não podem se repetir.

---

## 6. Fluxo básico de funcionamento

1. O visitante acessa o site e conhece o projeto, os conteúdos públicos e o simulador.
2. Cria uma conta (cadastro) e faz login.
3. A API valida os dados e devolve um **token JWT**, guardado no front-end.
4. O usuário acessa o **painel** e cadastra suas receitas e despesas.
5. O sistema calcula o resumo do mês e exibe alertas conforme as regras de negócio.
6. O usuário cria metas e acompanha o progresso.
7. Estuda as trilhas de conteúdo e participa da comunidade.
8. O moderador publica conteúdos e modera a comunidade; o administrador gerencia usuários e categorias.

```
Visitante → Cadastro/Login → JWT → Painel → Transações / Metas / Conteúdos / Comunidade
                                      ↓
                          Regras de negócio e alertas
```

---

## 7. Tecnologias

- **Front-end:** HTML, CSS e JavaScript (manipulação do DOM e Fetch API)
- **Back-end:** Node.js e Express
- **Banco de dados:** MySQL
- **Autenticação:** JWT (JSON Web Token) e hash de senhas
- **Versionamento:** Git e GitHub

---

## 8. Estrutura do projeto

```
dinheiro-consciente/
├── backend/
│   ├── src/
│   │   ├── routes/         # auth, usuario, transacao, categoria, meta, limite
│   │   ├── controllers/    # regras de negócio e validações de cada rota
│   │   ├── middlewares/    # auth.js, autorizar.js, errorHandler.js
│   │   ├── database/       # connection.js (conexão com o MySQL)
│   │   ├── utils/          # validacoes.js (datas, valores, ids)
│   │   ├── app.js          # Configuração do Express
│   │   └── server.js       # Inicialização do servidor
│   ├── package.json
│   └── .env.example        # Modelo das variáveis de ambiente
├── frontend/
│   ├── css/style.css
│   ├── js/                 # api.js (Fetch + sessão), login.js, cadastro.js, painel.js
│   ├── pages/              # login.html, cadastro.html, painel.html
│   └── index.html
├── sql/
│   └── schema.sql          # Script do banco de dados
├── docs/
├── .gitignore
└── README.md
```

## 9. Banco de dados

O banco `dinheiro_consciente` (MySQL) está no arquivo [`sql/schema.sql`](sql/schema.sql).

| Tabela | Descrição | Relacionamentos |
|---|---|---|
| `usuarios` | Contas e perfil de acesso (`usuario`, `moderador`, `admin`) | — |
| `categorias` | Categorias de receitas e despesas | — |
| `transacoes` | Receitas e despesas dos usuários | FK `usuario_id`, FK `categoria_id` |
| `limites_categoria` | Limite mensal por categoria | FK `usuario_id`, FK `categoria_id` |
| `metas` | Metas financeiras | FK `usuario_id` |
| `conteudos` | Conteúdos educativos | FK `autor_id` |
| `posts` | Posts da comunidade | FK `usuario_id` |
| `comentarios` | Comentários dos posts | FK `post_id`, FK `usuario_id` |

## 10. Autenticação e permissões

- Senhas protegidas com hash (**bcryptjs**); nunca são salvas em texto puro.
- Login gera um **token JWT** (guarda `id` e `perfil`, expira em 2h).
- `middlewares/auth.js` valida o token; `middlewares/autorizar.js` restringe rotas por perfil.
- Todo cadastro novo entra como `usuario`; só o `admin` altera perfis.

## 11. Como executar

1. Instale Node.js (LTS) e MySQL 8.
2. Execute o script `sql/schema.sql` no MySQL.
3. Em `backend/`, copie `.env.example` para `.env` e preencha com seus dados.
4. Rode:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
5. No arquivo `.env`, defina `DB_PASSWORD` (senha do seu MySQL) e `JWT_SECRET` (uma frase longa e secreta).
6. Abra **http://localhost:3000** no navegador (o servidor entrega o front-end) e teste a API em `http://localhost:3000/api/saude`.

### 12. Como testar

1. Cadastre um usuário em `POST /api/auth/cadastro` e faça login em `POST /api/auth/login` para obter o token.
2. Envie o token no cabeçalho `Authorization: Bearer SEU_TOKEN`.
3. Para criar um administrador, rode no MySQL:
   ```sql
   UPDATE usuarios SET perfil = 'admin' WHERE email = 'seu@email.com';
   ```
   e faça login de novo para gerar um token com o novo perfil.

## 13. Rotas da API (Entregas 2 e 3)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/saude` | Público | Testa se a API está no ar |
| POST | `/api/auth/cadastro` | Público | Cadastra usuário |
| POST | `/api/auth/login` | Público | Login, retorna o JWT |
| GET | `/api/auth/perfil` | Logado | Dados do usuário logado |
| GET | `/api/usuarios` | Admin | Lista usuários |
| PUT | `/api/usuarios/:id/perfil` | Admin | Altera o perfil de um usuário |
| GET | `/api/transacoes` | Logado | Lista **suas** transações (filtros `mes`, `tipo`, `categoria_id`) |
| GET | `/api/transacoes/resumo?mes=AAAA-MM` | Logado | Receitas, despesas, saldo e alertas do mês |
| GET | `/api/transacoes/:id` | Logado (dono) | Busca uma transação |
| POST | `/api/transacoes` | Logado | Cadastra transação |
| PUT | `/api/transacoes/:id` | Logado (dono) | Atualiza transação |
| DELETE | `/api/transacoes/:id` | Logado (dono) | Exclui transação |
| GET | `/api/categorias` | Logado | Lista categorias |
| POST / PUT / DELETE | `/api/categorias[/:id]` | Admin | Gerencia categorias |
| GET / POST | `/api/metas` | Logado | Lista / cria suas metas |
| GET / PUT / DELETE | `/api/metas/:id` | Logado (dono) | Busca / atualiza / exclui meta |
| GET | `/api/limites` | Logado | Lista seus limites por categoria |
| PUT / DELETE | `/api/limites/:categoria_id` | Logado | Define (cria ou atualiza) / remove limite |

### Regras de negócio implementadas na API (Entrega 3)
- Cada usuário só vê, edita e exclui as **suas** transações, metas e limites (`WHERE usuario_id` em todas as consultas); registro de outra pessoa retorna 404.
- Valor da transação > 0, tipo `receita`/`despesa`, data real e categoria existente **do mesmo tipo** da transação.
- Alerta de risco de endividamento quando despesas > receitas no mês.
- Aviso quando uma categoria passa do limite mensal definido pelo usuário.
- Progresso da meta calculado em % e limitado a 100% (valor guardado não pode passar do valor da meta).
- Categoria já usada em transações não pode ser excluída (409). Somente o admin gerencia categorias.


---

## 14. Cronograma das entregas

| Entrega | Foco | Situação |
|---|---|---|
| 1 | Problema, proposta e estrutura inicial | ✅ Entregue |
| 2 | Banco de dados, cadastro, login e JWT | ✅ Entregue |
| 3 | CRUD, integração e permissões | ✅ Entregue |
| 4 | Projeto completo, documentação e apresentação | ⏳ |

---

## 15. Referências

- ANBIMA. *Por onde começar: Educação financeira no Brasil*. 2024.
- Banco Central do Brasil. *Relatório de Letramento Financeiro*. 2025.
- OECD. *International Survey of Adult Financial Literacy*. 2023.
- Serasa. *Mapa da Inadimplência 2025*.
- CNC. Pesquisa de Endividamento e Inadimplência das Famílias.
