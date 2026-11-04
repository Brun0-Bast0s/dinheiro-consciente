-- =====================================================
-- Dinheiro Consciente - Banco de dados (MySQL 8)
-- Entrega 2: tabelas, chaves primarias, estrangeiras e relacionamentos
-- =====================================================

CREATE DATABASE IF NOT EXISTS dinheiro_consciente
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dinheiro_consciente;
UPDATE usuarios SET perfil = 'admin' WHERE email = 'bruno@teste.com';

SELECT id, nome, email, perfil FROM usuarios;

SELECT id, nome, email, senha_hash, perfil FROM usuarios;
 
-- Usuarios do sistema (o campo "perfil" define o nivel de acesso)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('usuario', 'moderador', 'admin') NOT NULL DEFAULT 'usuario',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categorias de receitas e despesas (gerenciadas pelo admin)
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  UNIQUE KEY uq_categoria (nome, tipo)
);

-- Transacoes financeiras (entidade principal do CRUD)
CREATE TABLE IF NOT EXISTS transacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  categoria_id INT NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao VARCHAR(200),
  data_transacao DATE NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

-- Limite mensal de gastos que cada usuario define por categoria
CREATE TABLE IF NOT EXISTS limites_categoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  categoria_id INT NOT NULL,
  valor_limite DECIMAL(10,2) NOT NULL CHECK (valor_limite > 0),
  UNIQUE KEY uq_limite (usuario_id, categoria_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Metas financeiras (ex.: reserva de emergencia)
CREATE TABLE IF NOT EXISTS metas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  valor_meta DECIMAL(10,2) NOT NULL CHECK (valor_meta > 0),
  valor_atual DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_atual >= 0),
  prazo DATE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Conteudos educativos (publicados por moderador/admin)
CREATE TABLE IF NOT EXISTS conteudos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  autor_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  tema VARCHAR(60) NOT NULL,
  resumo VARCHAR(300),
  corpo TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- Comunidade: posts e comentarios
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  texto TEXT NOT NULL,
  oculto BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  usuario_id INT NOT NULL,
  texto VARCHAR(500) NOT NULL,
  oculto BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Dados iniciais: categorias padrao
INSERT IGNORE INTO categorias (nome, tipo) VALUES
  ('Salario', 'receita'),
  ('Renda extra', 'receita'),
  ('Moradia', 'despesa'),
  ('Alimentacao', 'despesa'),
  ('Transporte', 'despesa'),
  ('Saude', 'despesa'),
  ('Educacao', 'despesa'),
  ('Lazer', 'despesa'),
  ('Dividas', 'despesa'),
  ('Outros', 'despesa');
