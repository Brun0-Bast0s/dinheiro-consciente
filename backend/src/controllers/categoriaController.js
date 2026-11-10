const db = require('../database/connection');
const { idValido } = require('../utils/validacoes');

const TIPOS = ['receita', 'despesa'];

function validar(body) {
  const nome = (body.nome || '').trim();
  if (!nome || nome.length > 60) return 'O nome é obrigatório e pode ter até 60 caracteres.';
  if (!TIPOS.includes(body.tipo)) return 'O tipo deve ser "receita" ou "despesa".';
  return null;
}

// GET /api/categorias?tipo=despesa  (qualquer usuario logado)
async function listar(req, res, next) {
  try {
    let sql = 'SELECT id, nome, tipo FROM categorias';
    const params = [];
    if (req.query.tipo) {
      if (!TIPOS.includes(req.query.tipo)) return res.status(400).json({ erro: 'Tipo inválido.' });
      sql += ' WHERE tipo = ?';
      params.push(req.query.tipo);
    }
    const [linhas] = await db.query(sql + ' ORDER BY tipo, nome', params);
    res.json(linhas);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/categorias  (somente admin)
async function criar(req, res, next) {
  try {
    const erro = validar(req.body);
    if (erro) return res.status(400).json({ erro });

    const [r] = await db.query('INSERT INTO categorias (nome, tipo) VALUES (?, ?)', [req.body.nome.trim(), req.body.tipo]);
    res.status(201).json({ mensagem: 'Categoria criada com sucesso.', id: r.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Já existe uma categoria com esse nome e tipo.' });
    next(e);
  }
}

// PUT /api/categorias/:id  (somente admin)
async function atualizar(req, res, next) {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const erro = validar(req.body);
    if (erro) return res.status(400).json({ erro });

    const [r] = await db.query('UPDATE categorias SET nome = ?, tipo = ? WHERE id = ?', [req.body.nome.trim(), req.body.tipo, id]);
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Categoria não encontrada.' });
    res.json({ mensagem: 'Categoria atualizada com sucesso.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Já existe uma categoria com esse nome e tipo.' });
    next(e);
  }
}

// DELETE /api/categorias/:id  (somente admin)
async function excluir(req, res, next) {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const [r] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Categoria não encontrada.' });
    res.json({ mensagem: 'Categoria excluída com sucesso.' });
  } catch (e) {
    // transacoes.categoria_id usa ON DELETE RESTRICT: categoria em uso nao pode ser apagada
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ erro: 'Esta categoria já foi usada em transações e não pode ser excluída.' });
    }
    next(e);
  }
}

module.exports = { listar, criar, atualizar, excluir };
