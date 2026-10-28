// src/routes/cardapioRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { cardapioSchema } = require('../schemas/cardapioSchema');
const { listar, atualizar } = require('../controllers/cardapioController');

router.use(autenticar);

router.get('/', listar);
router.put('/:diaSemana', exigirPapel('ADMIN'), validar(cardapioSchema), atualizar);

module.exports = router;
