const express = require('express');
const router = express.Router();
const controller = require('../controllers/transacaoController');
const autenticar = require('../middlewares/auth');

// Todas as rotas exigem login. Cada usuario so mexe nas proprias transacoes.
router.use(autenticar);

// "resumo" precisa vir antes de "/:id", senao o Express acharia que resumo e um id
router.get('/resumo', controller.resumo);
router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

module.exports = router;
