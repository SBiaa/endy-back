// src/routes/registroDiarioRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { registroDiarioSchema, registroDiarioUpdateSchema } = require('../schemas/registroDiarioSchema');
const { criar, listar, atualizar, deletar } = require('../controllers/registroDiarioController');

router.use(autenticar);

router.post('/', exigirPapel('ADMIN', 'PROFESSOR'), validar(registroDiarioSchema), criar);
router.get('/', listar);
router.put('/:id', exigirPapel('ADMIN', 'PROFESSOR'), validar(registroDiarioUpdateSchema), atualizar);
router.delete('/:id', exigirPapel('ADMIN'), deletar);

module.exports = router;
