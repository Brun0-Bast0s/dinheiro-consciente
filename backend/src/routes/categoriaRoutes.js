const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoriaController');
const autenticar = require('../middlewares/auth');
const autorizar = require('../middlewares/autorizar');

router.use(autenticar);

// Qualquer usuario logado pode LER as categorias (precisa delas para lancar transacoes)
router.get('/', controller.listar);

// Somente o admin cria, edita e exclui
router.post('/', autorizar('admin'), controller.criar);
router.put('/:id', autorizar('admin'), controller.atualizar);
router.delete('/:id', autorizar('admin'), controller.excluir);

module.exports = router;
