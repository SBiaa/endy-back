// src/routes/dashboardRoutes.js
const express = require('express');
const autenticar = require('../middlewares/autenticar');
const exigirPapel = require('../middlewares/exigirPapel');
const { admin } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/admin', autenticar, exigirPapel('ADMIN'), admin);

module.exports = router;
