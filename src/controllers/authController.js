// src/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  // busca o usuário pelo email
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // mensagem genérica de propósito: não dizemos se foi o email ou a senha
  // que errou, pra não dar dica pra quem tenta adivinhar credenciais
  if (!usuario) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaConfere) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  // monta o token com o que vamos precisar depois: id e papel
  const token = jwt.sign(
    { id: usuario.id, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // token válido por 7 dias
  );

  // token vive num cookie httpOnly, não no corpo da resposta
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // https só em prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // cross-site em prod (front e back em domínios diferentes)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias, mesmo prazo do JWT
  });

  // devolve só os dados básicos (nunca a senhaHash!)
  return res.json({
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    },
  });
}

function logout(req, res) {
  res.clearCookie('token');
  return res.status(200).json({ mensagem: 'Logout realizado com sucesso' });
}

module.exports = { login, logout };