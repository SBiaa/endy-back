// src/routes/responsavelAlunoRoutes.js

const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const { vincular, desvincular } = require('../controllers/responsavelAlunoController');

router.use(autenticar, exigirPapel('ADMIN'));

router.post('/', vincular);
router.delete('/:id', desvincular);

module.exports = router;
