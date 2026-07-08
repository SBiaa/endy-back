// src/controllers/turmaController.js
// CRUD de Turma, restrito a ADMIN.

const prisma = require('../lib/prisma');

async function criar(req, res) {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'nome é obrigatório' });
  }

  const turma = await prisma.turma.create({ data: { nome } });

  return res.status(201).json(turma);
}

async function listar(req, res) {
  const turmas = await prisma.turma.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { alunos: true, professores: true } } },
  });

  return res.json(turmas);
}

async function buscarPorId(req, res) {
  const { id } = req.params;

  const turma = await prisma.turma.findUnique({
    where: { id },
    include: {
      alunos: true,
      professores: { select: { id: true, nome: true, email: true } },
    },
  });

  if (!turma) {
    return res.status(404).json({ erro: 'Turma não encontrada' });
  }

  return res.json(turma);
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { nome } = req.body;

  const turmaExistente = await prisma.turma.findUnique({ where: { id } });

  if (!turmaExistente) {
    return res.status(404).json({ erro: 'Turma não encontrada' });
  }

  const turma = await prisma.turma.update({ where: { id }, data: { nome } });

  return res.json(turma);
}

async function deletar(req, res) {
  const { id } = req.params;

  const turmaExistente = await prisma.turma.findUnique({ where: { id } });

  if (!turmaExistente) {
    return res.status(404).json({ erro: 'Turma não encontrada' });
  }

  try {
    await prisma.turma.delete({ where: { id } });
  } catch (erro) {
    if (erro.code === 'P2003') {
      return res
        .status(400)
        .json({ erro: 'Não é possível excluir: ainda há alunos ou professores vinculados a esta turma.' });
    }

    throw erro;
  }

  return res.status(204).send();
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar };
