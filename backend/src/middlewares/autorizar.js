// Middleware de AUTORIZACAO: so deixa passar os perfis permitidos.
// Uso: autorizar('admin')  ou  autorizar('moderador', 'admin')
function autorizar(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: 'Acesso negado para o seu perfil.' });
    }
    next();
  };
}

module.exports = autorizar;
