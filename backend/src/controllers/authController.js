const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/cadastro
async function cadastrar(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ erro: 'E-mail inválido.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const emailLimpo = email.trim().toLowerCase();

    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [emailLimpo]);
    if (existe.length > 0) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // A senha nunca e salva pura: guardamos apenas o hash
    const senhaHash = await bcrypt.hash(senha, 10);

    // Todo cadastro novo entra como "usuario". Perfis maiores so o admin concede.
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome.trim(), emailLimpo, senhaHash]
    );

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: { id: resultado.insertId, nome: nome.trim(), email: emailLimpo, perfil: 'usuario' }
    });
  } catch (erro) {
    next(erro);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const [linhas] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
    const usuario = linhas[0];

    // Mesma mensagem para e-mail ou senha errados (nao revela qual deles falhou)
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }
    if (!usuario.ativo) {
      return res.status(403).json({ erro: 'Conta desativada.' });
    }

    // O token guarda id e perfil e expira no tempo definido no .env
    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
    });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/auth/perfil  (rota protegida)
async function perfil(req, res, next) {
  try {
    const [linhas] = await db.query(
      'SELECT id, nome, email, perfil, criado_em FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(linhas[0]);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { cadastrar, login, perfil };
