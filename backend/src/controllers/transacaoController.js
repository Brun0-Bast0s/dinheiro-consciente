const db = require('../database/connection');
const { dataValida, numeroValido, idValido, intervaloDoMes, mesAtual } = require('../utils/validacoes');

const TIPOS = ['receita', 'despesa'];

// Valida o corpo (POST/PUT). Retorna lista de erros (vazia = ok)
async function validar(body) {
  const erros = [];
  const { tipo, valor, categoria_id, data_transacao, descricao } = body;

  if (!TIPOS.includes(tipo)) erros.push('O tipo deve ser "receita" ou "despesa".');
  if (!numeroValido(valor)) erros.push('O valor deve ser um número maior que zero.');
  if (!dataValida(data_transacao)) erros.push('Data inválida. Use o formato AAAA-MM-DD.');
  if (descricao && String(descricao).length > 200) erros.push('A descrição pode ter no máximo 200 caracteres.');

  const idCategoria = idValido(categoria_id);
  if (!idCategoria) {
    erros.push('Categoria obrigatória.');
  } else if (TIPOS.includes(tipo)) {
    // Regra de negocio: a categoria precisa existir e ser do mesmo tipo da transacao
    const [cat] = await db.query('SELECT tipo FROM categorias WHERE id = ?', [idCategoria]);
    if (cat.length === 0) erros.push('Categoria não encontrada.');
    else if (cat[0].tipo !== tipo) erros.push(`Esta categoria é de ${cat[0].tipo}, não de ${tipo}.`);
  }
  return erros;
}

const SELECT_BASE = `
  SELECT t.id, t.tipo, t.valor, t.descricao, t.data_transacao, t.categoria_id, c.nome AS categoria
  FROM transacoes t
  JOIN categorias c ON c.id = t.categoria_id`;

// GET /api/transacoes?mes=AAAA-MM&tipo=despesa&categoria_id=3
async function listar(req, res, next) {
  try {
    const condicoes = ['t.usuario_id = ?'];
    const params = [req.usuario.id];

    if (req.query.mes) {
      const intervalo = intervaloDoMes(req.query.mes);
      if (!intervalo) return res.status(400).json({ erro: 'Mês inválido. Use AAAA-MM.' });
      condicoes.push('t.data_transacao >= ? AND t.data_transacao < ?');
      params.push(intervalo.inicio, intervalo.fim);
    }
    if (req.query.tipo) {
      if (!TIPOS.includes(req.query.tipo)) return res.status(400).json({ erro: 'Tipo inválido.' });
      condicoes.push('t.tipo = ?');
      params.push(req.query.tipo);
    }
    if (req.query.categoria_id) {
      const idCat = idValido(req.query.categoria_id);
      if (!idCat) return res.status(400).json({ erro: 'Categoria inválida.' });
      condicoes.push('t.categoria_id = ?');
      params.push(idCat);
    }

    const [linhas] = await db.query(
      `${SELECT_BASE} WHERE ${condicoes.join(' AND ')} ORDER BY t.data_transacao DESC, t.id DESC`,
      params
    );
    res.json(linhas);
  } catch (erro) {
    next(erro);
  }
}

// GET /api/transacoes/:id
async function buscar(req, res, next) {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    // Regra 1: so enxerga a transacao se ela for do proprio usuario
    const [linhas] = await db.query(`${SELECT_BASE} WHERE t.id = ? AND t.usuario_id = ?`, [id, req.usuario.id]);
    if (linhas.length === 0) return res.status(404).json({ erro: 'Transação não encontrada.' });
    res.json(linhas[0]);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/transacoes
async function criar(req, res, next) {
  try {
    const erros = await validar(req.body);
    if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

    const { tipo, valor, categoria_id, data_transacao, descricao } = req.body;
    const [resultado] = await db.query(
      `INSERT INTO transacoes (usuario_id, categoria_id, tipo, valor, descricao, data_transacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, categoria_id, tipo, Number(valor), (descricao || '').trim() || null, data_transacao]
    );
    res.status(201).json({ mensagem: 'Transação cadastrada com sucesso.', id: resultado.insertId });
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/transacoes/:id
async function atualizar(req, res, next) {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const erros = await validar(req.body);
    if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

    const { tipo, valor, categoria_id, data_transacao, descricao } = req.body;
    // O "AND usuario_id" garante que ninguem edita transacao de outra pessoa
    const [resultado] = await db.query(
      `UPDATE transacoes
       SET categoria_id = ?, tipo = ?, valor = ?, descricao = ?, data_transacao = ?
       WHERE id = ? AND usuario_id = ?`,
      [categoria_id, tipo, Number(valor), (descricao || '').trim() || null, data_transacao, id, req.usuario.id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Transação não encontrada.' });
    res.json({ mensagem: 'Transação atualizada com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/transacoes/:id
async function excluir(req, res, next) {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const [resultado] = await db.query('DELETE FROM transacoes WHERE id = ? AND usuario_id = ?', [id, req.usuario.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Transação não encontrada.' });
    res.json({ mensagem: 'Transação excluída com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

// GET /api/transacoes/resumo?mes=AAAA-MM
// Calcula receitas, despesas, saldo e gera os alertas (regras 3 e 4)
async function resumo(req, res, next) {
  try {
    const mes = req.query.mes || mesAtual();
    const intervalo = intervaloDoMes(mes);
    if (!intervalo) return res.status(400).json({ erro: 'Mês inválido. Use AAAA-MM.' });

    const [totais] = await db.query(
      `SELECT tipo, COALESCE(SUM(valor), 0) AS total
       FROM transacoes
       WHERE usuario_id = ? AND data_transacao >= ? AND data_transacao < ?
       GROUP BY tipo`,
      [req.usuario.id, intervalo.inicio, intervalo.fim]
    );
    const receitas = Number(totais.find((t) => t.tipo === 'receita')?.total || 0);
    const despesas = Number(totais.find((t) => t.tipo === 'despesa')?.total || 0);
    const saldo = Number((receitas - despesas).toFixed(2));

    const [porCategoria] = await db.query(
      `SELECT c.id AS categoria_id, c.nome AS categoria, SUM(t.valor) AS total, l.valor_limite AS limite
       FROM transacoes t
       JOIN categorias c ON c.id = t.categoria_id
       LEFT JOIN limites_categoria l ON l.categoria_id = c.id AND l.usuario_id = t.usuario_id
       WHERE t.usuario_id = ? AND t.tipo = 'despesa' AND t.data_transacao >= ? AND t.data_transacao < ?
       GROUP BY c.id, c.nome, l.valor_limite
       ORDER BY total DESC`,
      [req.usuario.id, intervalo.inicio, intervalo.fim]
    );

    const alertas = [];
    // Regra 3: despesas acima das receitas = risco de endividamento
    if (despesas > receitas && despesas > 0) {
      alertas.push({
        nivel: 'perigo',
        mensagem: 'Atenção: suas despesas do mês ultrapassaram suas receitas. Há risco de endividamento.'
      });
    }
    // Regra 4: categoria acima do limite mensal definido pelo usuario
    for (const cat of porCategoria) {
      if (cat.limite !== null && cat.total > cat.limite) {
        alertas.push({
          nivel: 'aviso',
          mensagem: `Você ultrapassou o limite de "${cat.categoria}" (gastou ${cat.total.toFixed(2)} de ${cat.limite.toFixed(2)}).`
        });
      }
    }

    res.json({ mes, receitas, despesas, saldo, porCategoria, alertas });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, buscar, criar, atualizar, excluir, resumo };
