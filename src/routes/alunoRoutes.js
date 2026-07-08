// src/routes/alunoRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const {
  criar,
  listar,
  buscarPorId,
  atualizar,
  deletar,
} = require('../controllers/alunoController');

router.use(autenticar);

router.post('/', exigirPapel('ADMIN'), criar);
router.get('/', listar);
router.get('/:id', buscarPorId);
router.put('/:id', exigirPapel('ADMIN'), atualizar);
router.delete('/:id', exigirPapel('ADMIN'), deletar);

module.exports = router;
