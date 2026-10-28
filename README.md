# 💰 Dinheiro Consciente

> Plataforma web de educação financeira com ferramentas práticas de controle de gastos, metas e uma comunidade de aprendizado.

**Autor:** Bruno da Silva Bastos
**Curso/Disciplina:** Técnico — Projeto Web
**Status:** 🚧 Entrega 1 — Problema e estrutura inicial

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
│   │   ├── routes/         # Definição das rotas da API
│   │   ├── controllers/    # Lógica e regras de negócio
│   │   ├── middlewares/    # Autenticação, autorização, tratamento de erros
│   │   └── database/       # Conexão com o MySQL
│   └── .env.example        # Modelo das variáveis de ambiente
├── frontend/
│   ├── css/
│   ├── js/
│   ├── pages/
│   └── index.html
├── sql/
│   └── schema.sql          # Script do banco de dados
├── docs/
├── .gitignore
└── README.md
```

---

## 9. Cronograma das entregas

| Entrega | Foco | Situação |
|---|---|---|
| 1 | Problema, proposta e estrutura inicial | ✅ Entregue |
| 2 | Banco de dados, cadastro, login e JWT | ⏳ |
| 3 | CRUD, integração e permissões | ⏳ |
| 4 | Projeto completo, documentação e apresentação | ⏳ |

---

## 10. Referências

- ANBIMA. *Por onde começar: Educação financeira no Brasil*. 2024.
- Banco Central do Brasil. *Relatório de Letramento Financeiro*. 2025.
- OECD. *International Survey of Adult Financial Literacy*. 2023.
- Serasa. *Mapa da Inadimplência 2025*.
- CNC. Pesquisa de Endividamento e Inadimplência das Famílias.
