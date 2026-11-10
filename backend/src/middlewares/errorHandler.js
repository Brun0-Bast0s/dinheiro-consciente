// Tratamento basico de erros
function errorHandler(erro, req, res, next) {
  // JSON enviado com sintaxe errada
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = errorHandler;
