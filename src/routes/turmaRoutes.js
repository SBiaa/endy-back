// src/routes/turmaRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { turmaSchema } = require('../schemas/turmaSchema');
const {
  criar,
  listar,
  buscarPorId,
  atualizar,
  deletar,
} = require('../controllers/turmaController');

router.use(autenticar);

router.post('/', exigirPapel('ADMIN'), validar(turmaSchema), criar);
router.get('/', listar);
router.get('/:id', buscarPorId);
router.put('/:id', exigirPapel('ADMIN'), validar(turmaSchema), atualizar);
router.delete('/:id', exigirPapel('ADMIN'), deletar);

module.exports = router;
