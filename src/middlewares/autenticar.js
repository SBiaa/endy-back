// src/middlewares/autenticar.js
// Valida o token JWT enviado no cookie httpOnly "token".
// Se válido, popula req.usuario = { id, papel } pro resto da rota usar.

const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ erro: 'Token não enviado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, papel }
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;