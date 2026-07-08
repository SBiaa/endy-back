// src/routes/responsavelAlunoRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { responsavelAlunoSchema } = require('../schemas/responsavelAlunoSchema');
const { vincular, desvincular } = require('../controllers/responsavelAlunoController');

router.use(autenticar, exigirPapel('ADMIN'));

router.post('/', validar(responsavelAlunoSchema), vincular);
router.delete('/:id', desvincular);

module.exports = router;
