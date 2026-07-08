// src/controllers/usuarioController.js
// CRUD de Usuario, restrito a ADMIN, para gerenciar contas de PROFESSOR e RESPONSAVEL.
// Contas ADMIN não são gerenciadas por aqui.

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');

const PAPEIS_GERENCIAVEIS = ['PROFESSOR', 'RESPONSAVEL'];

// sem 0/O, 1/l/I — evita confusão na hora de repassar/digitar a senha temporária
const CHARSET_SENHA_TEMPORARIA = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function gerarSenhaTemporaria(tamanho = 10) {
  let senha = '';

  for (let i = 0; i < tamanho; i++) {
    senha += CHARSET_SENHA_TEMPORARIA[crypto.randomInt(CHARSET_SENHA_TEMPORARIA.length)];
  }

  return senha;
}

// remove senhaHash antes de devolver pro cliente
function semSenha(usuario) {
  const { senhaHash, ...resto } = usuario;
  return resto;
}

async function criar(req, res) {
  const { nome, email, papel } = req.body;

  if (!nome || !email || !papel) {
    return res.status(400).json({ erro: 'nome, email e papel são obrigatórios' });
  }

  if (!PAPEIS_GERENCIAVEIS.includes(papel)) {
    return res.status(400).json({ erro: 'papel deve ser PROFESSOR ou RESPONSAVEL' });
  }

  const emailEmUso = await prisma.usuario.findUnique({ where: { email } });

  if (emailEmUso) {
    return res.status(409).json({ erro: 'Já existe um usuário com esse email' });
  }

  const senhaTemporaria = gerarSenhaTemporaria();
  const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash, papel },
  });

  // senhaTemporaria só aparece aqui, nessa resposta do POST — não é salva em texto plano
  return res.status(201).json({ usuario: semSenha(usuario), senhaTemporaria });
}

async function listar(req, res) {
  const { papel } = req.query;

  const where = papel ? { papel } : { papel: { in: PAPEIS_GERENCIAVEIS } };

  const usuarios = await prisma.usuario.findMany({ where, orderBy: { nome: 'asc' } });

  return res.json(usuarios.map(semSenha));
}

async function buscarPorId(req, res) {
  const { id } = req.params;

  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  return res.json(semSenha(usuario));
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, email, senha, papel } = req.body;

  const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });

  if (!usuarioExistente) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  if (papel && !PAPEIS_GERENCIAVEIS.includes(papel)) {
    return res.status(400).json({ erro: 'papel deve ser PROFESSOR ou RESPONSAVEL' });
  }

  const data = { nome, email, papel };

  if (senha) {
    data.senhaHash = await bcrypt.hash(senha, 10);
  }

  const usuario = await prisma.usuario.update({ where: { id }, data });

  return res.json(semSenha(usuario));
}

async function deletar(req, res) {
  const { id } = req.params;

  const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });

  if (!usuarioExistente) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  try {
    await prisma.usuario.delete({ where: { id } });
  } catch (erro) {
    if (erro.code === 'P2003') {
      return res
        .status(400)
        .json({ erro: 'Não é possível excluir: este usuário possui vínculos ativos (turma ou aluno associado).' });
    }

    throw erro;
  }

  return res.status(204).send();
}

async function meuPerfil(req, res) {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario.id } });

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  return res.json(semSenha(usuario));
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar, meuPerfil };
