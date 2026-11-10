const db = require('../database/connection');
const { numeroValido, idValido } = require('../utils/validacoes');

// GET /api/limites
async function listar(req, res, next) {
  try {
    const [linhas] = await db.query(
      `SELECT l.categoria_id, c.nome AS categoria, l.valor_limite
       FROM limites_categoria l JOIN categorias c ON c.id = l.categoria_id
       WHERE l.usuario_id = ? ORDER BY c.nome`,
      [req.usuario.id]
    );
    res.json(linhas);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/limites/:categoria_id  -> cria o limite ou atualiza se ja existir
async function salvar(req, res, next) {
  try {
    const categoriaId = idValido(req.params.categoria_id);
    if (!categoriaId) return res.status(400).json({ erro: 'Categoria inválida.' });
    if (!numeroValido(req.body.valor_limite)) {
      return res.status(400).json({ erro: 'O limite deve ser maior que zero.' });
    }

    const [cat] = await db.query('SELECT tipo FROM categorias WHERE id = ?', [categoriaId]);
    if (cat.length === 0) return res.status(404).json({ erro: 'Categoria não encontrada.' });
    if (cat[0].tipo !== 'despesa') return res.status(400).json({ erro: 'Só é possível definir limite para categorias de despesa.' });

    await db.query(
      `INSERT INTO limites_categoria (usuario_id, categoria_id, valor_limite) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE valor_limite = VALUES(valor_limite)`,
      [req.usuario.id, categoriaId, Number(req.body.valor_limite)]
    );
    res.json({ mensagem: 'Limite salvo com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/limites/:categoria_id
async function excluir(req, res, next) {
  try {
    const categoriaId = idValido(req.params.categoria_id);
    if (!categoriaId) return res.status(400).json({ erro: 'Categoria inválida.' });
    const [r] = await db.query('DELETE FROM limites_categoria WHERE usuario_id = ? AND categoria_id = ?', [req.usuario.id, categoriaId]);
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Limite não encontrado.' });
    res.json({ mensagem: 'Limite removido com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, salvar, excluir };
