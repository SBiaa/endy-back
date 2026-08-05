// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const validar = require('../middlewares/validar');
const { loginSchema } = require('../schemas/authSchema');
const { login, logout } = require('../controllers/authController');

// limita tentativas de força bruta na senha: 10 tentativas por IP a cada 15min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

router.post('/login', loginLimiter, validar(loginSchema), login);
router.post('/logout', logout);

module.exports = router;