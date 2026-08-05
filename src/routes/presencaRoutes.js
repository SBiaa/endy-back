// src/routes/presencaRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { presencaSchema, presencaUpdateSchema, presencaLoteSchema } = require('../schemas/presencaSchema');
const { criar, listar, atualizar, deletar, criarLote } = require('../controllers/presencaController');

router.use(autenticar);

router.post('/', exigirPapel('ADMIN', 'PROFESSOR'), validar(presencaSchema), criar);
router.post('/lote', exigirPapel('ADMIN', 'PROFESSOR'), validar(presencaLoteSchema), criarLote);
router.get('/', listar);
router.put('/:id', exigirPapel('ADMIN', 'PROFESSOR'), validar(presencaUpdateSchema), atualizar);
router.delete('/:id', exigirPapel('ADMIN'), deletar);

module.exports = router;
