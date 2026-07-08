// src/routes/publicacaoRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const { criar, listar, atualizar, deletar } = require('../controllers/publicacaoController');

router.use(autenticar);

router.post('/', exigirPapel('ADMIN', 'PROFESSOR'), criar);
router.get('/', listar);
router.put('/:id', atualizar);
router.delete('/:id', deletar);

module.exports = router;
