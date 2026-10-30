const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const autenticar = require('../middlewares/auth');
const autorizar = require('../middlewares/autorizar');

// Todas as rotas abaixo exigem login E perfil admin
router.use(autenticar, autorizar('admin'));

router.get('/', usuarioController.listar);
router.put('/:id/perfil', usuarioController.alterarPerfil);

module.exports = router;
