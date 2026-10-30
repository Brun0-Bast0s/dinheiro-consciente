const db = require('../database/connection');

const PERFIS_VALIDOS = ['usuario', 'moderador', 'admin'];

// GET /api/usuarios  (somente admin)
async function listar(req, res, next) {
  try {
    const [linhas] = await db.query(
      'SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios ORDER BY id'
    );
    res.json(linhas);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/usuarios/:id/perfil  (somente admin)
async function alterarPerfil(req, res, next) {
  try {
    const { id } = req.params;
    const { perfil } = req.body;

    if (!PERFIS_VALIDOS.includes(perfil)) {
      return res.status(400).json({ erro: 'Perfil inválido. Use: usuario, moderador ou admin.' });
    }
    if (Number(id) === req.usuario.id) {
      return res.status(400).json({ erro: 'Você não pode alterar o seu próprio perfil.' });
    }

    const [resultado] = await db.query('UPDATE usuarios SET perfil = ? WHERE id = ?', [perfil, id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ mensagem: 'Perfil atualizado com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, alterarPerfil };
