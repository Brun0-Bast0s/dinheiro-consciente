const db = require('../database/connection');
const { dataValida, numeroValido, idValido } = require('../utils/validacoes');

// Regra 5: progresso em % (valor guardado / valor da meta), maximo 100%
const SELECT_BASE = `
  SELECT id, titulo, valor_meta, valor_atual, prazo,
         ROUND(LEAST(valor_atual / valor_meta * 100, 100), 1) AS progresso
  FROM metas`;

function validar(body) {
  const erros = [];
  const { titulo, valor_meta, valor_atual, prazo } = body;
  const atual = valor_atual === undefined || valor_atual === '' ? 0 : valor_atual;

  if (!titulo || !String(titulo).trim() || String(titulo).length > 100) erros.push('O título é obrigatório (até 100 caracteres).');
  if (!numeroValido(valor_meta)) erros.push('O valor da meta deve ser maior que zero.');
  if (!numeroValido(atual, { permitirZero: true })) erros.push('O valor guardado não pode ser negativo.');
  // Regra 5: o progresso nao pode passar de 100%
  if (numeroValido(valor_meta) && numeroValido(atual, { permitirZero: true }) && Number(atual) > Number(valor_meta)) {
    erros.push('O valor guardado não pode ser maior que o valor da meta (limite de 100%).');
  }
  if (prazo && !dataValida(prazo)) erros.push('Prazo inválido. Use o formato AAAA-MM-DD.');
  return erros;
}

// GET /api/metas
async function listar(req, res, next) {
  try {
    const [linhas] = await db.query(`${SELECT_BASE} WHERE usuario_id = ? ORDER BY criado_em DESC`, [req.usuario.id]);
    res.json(linhas);
  } catch (erro) {
    next(erro);
  }
}

// GET /api/metas/:id
async function buscar(req, res, next) {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const [linhas] = await db.query(`${SELECT_BASE} WHERE id = ? AND usuario_id = ?`, [id, req.usuario.id]);
    if (linhas.length === 0) return res.status(404).json({ erro: 'Meta não encontrada.' });
    res.json(linhas[0]);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/metas
async function criar(req, res, next) {
  try {
    const erros = validar(req.body);
    if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

    const { titulo, valor_meta, valor_atual, prazo } = req.body;
    const [r] = await db.query(
      'INSERT INTO metas (usuario_id, titulo, valor_meta, valor_atual, prazo) VALUES (?, ?, ?, ?, ?)',
      [req.usuario.id, titulo.trim(), Number(valor_meta), Number(valor_atual || 0), prazo || null]
    );
    res.status(201).json({ mensagem: 'Meta criada com sucesso.', id: r.insertId });
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/metas/:id
async function atualizar(req, res, next) {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const erros = validar(req.body);
    if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

    const { titulo, valor_meta, valor_atual, prazo } = req.body;
    const [r] = await db.query(
      'UPDATE metas SET titulo = ?, valor_meta = ?, valor_atual = ?, prazo = ? WHERE id = ? AND usuario_id = ?',
      [titulo.trim(), Number(valor_meta), Number(valor_atual || 0), prazo || null, id, req.usuario.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Meta não encontrada.' });
    res.json({ mensagem: 'Meta atualizada com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/metas/:id
async function excluir(req, res, next) {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const [r] = await db.query('DELETE FROM metas WHERE id = ? AND usuario_id = ?', [id, req.usuario.id]);
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Meta não encontrada.' });
    res.json({ mensagem: 'Meta excluída com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, buscar, criar, atualizar, excluir };
