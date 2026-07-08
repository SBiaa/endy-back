// src/routes/alunoRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { alunoSchema, alunoUpdateSchema } = require('../schemas/alunoSchema');
const {
  criar,
  listar,
  buscarPorId,
  atualizar,
  deletar,
} = require('../controllers/alunoController');

router.use(autenticar);

router.post('/', exigirPapel('ADMIN'), validar(alunoSchema), criar);
router.get('/', listar);
router.get('/:id', buscarPorId);
router.put('/:id', exigirPapel('ADMIN'), validar(alunoUpdateSchema), atualizar);
router.delete('/:id', exigirPapel('ADMIN'), deletar);

module.exports = router;
