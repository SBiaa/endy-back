// src/routes/usuarioRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { usuarioSchema, usuarioUpdateSchema } = require('../schemas/usuarioSchema');
const {
  criar,
  listar,
  buscarPorId,
  atualizar,
  deletar,
  meuPerfil,
} = require('../controllers/usuarioController');

router.use(autenticar);

// precisa vir antes de '/:id', senão o Express casaria "me" como :id
router.get('/me', meuPerfil);

router.post('/', exigirPapel('ADMIN'), validar(usuarioSchema), criar);
router.get('/', exigirPapel('ADMIN'), listar);
router.get('/:id', exigirPapel('ADMIN'), buscarPorId);
router.put('/:id', exigirPapel('ADMIN'), validar(usuarioUpdateSchema), atualizar);
router.delete('/:id', exigirPapel('ADMIN'), deletar);

module.exports = router;
