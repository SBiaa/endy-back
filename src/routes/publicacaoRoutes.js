// src/routes/publicacaoRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { publicacaoSchema, publicacaoUpdateSchema } = require('../schemas/publicacaoSchema');
const { criar, listar, atualizar, deletar } = require('../controllers/publicacaoController');

router.use(autenticar);

router.post('/', exigirPapel('ADMIN', 'PROFESSOR'), validar(publicacaoSchema), criar);
router.get('/', listar);
router.put('/:id', validar(publicacaoUpdateSchema), atualizar);
router.delete('/:id', deletar);

module.exports = router;
