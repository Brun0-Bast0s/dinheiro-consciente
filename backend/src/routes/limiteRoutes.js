const express = require('express');
const router = express.Router();
const controller = require('../controllers/limiteController');
const autenticar = require('../middlewares/auth');

router.use(autenticar);

router.get('/', controller.listar);
router.put('/:categoria_id', controller.salvar);
router.delete('/:categoria_id', controller.excluir);

module.exports = router;
