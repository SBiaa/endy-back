// src/routes/professorTurmaRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const validar = require('../middlewares/validar');
const { professorTurmaSchema } = require('../schemas/professorTurmaSchema');
const { vincular, desvincular } = require('../controllers/professorTurmaController');

router.use(autenticar, exigirPapel('ADMIN'));

router.post('/', validar(professorTurmaSchema), vincular);
router.delete('/:turmaId/:professorId', desvincular);

module.exports = router;
