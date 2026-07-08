// src/routes/turmaRoutes.js

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
} = require('../controllers/turmaController');

router.use(autenticar, exigirPapel('ADMIN'));

router.post('/', criar);
router.get('/', listar);
router.get('/:id', buscarPorId);
router.put('/:id', atualizar);
router.delete('/:id', deletar);

module.exports = router;
