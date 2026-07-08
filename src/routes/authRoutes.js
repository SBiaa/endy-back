// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const validar = require('../middlewares/validar');
const { loginSchema } = require('../schemas/authSchema');
const { login, logout } = require('../controllers/authController');

router.post('/login', validar(loginSchema), login);
router.post('/logout', logout);

module.exports = router;