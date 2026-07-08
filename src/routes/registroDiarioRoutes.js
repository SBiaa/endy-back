// src/routes/registroDiarioRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const { criar, listar, atualizar, deletar } = require('../controllers/registroDiarioController');

router.use(autenticar);

router.post('/', exigirPapel('ADMIN', 'PROFESSOR'), criar);
router.get('/', listar);
router.put('/:id', exigirPapel('ADMIN', 'PROFESSOR'), atualizar);
router.delete('/:id', exigirPapel('ADMIN'), deletar);

module.exports = router;
