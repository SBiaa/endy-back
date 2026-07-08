// src/controllers/turmaController.js
// CRUD de Turma. Escrita (criar/atualizar/deletar) é ADMIN-only (garantido na rota).
// Leitura é liberada pra qualquer papel logado, mas escopada por vínculo.

const prisma = require('../lib/prisma');
const { professorVinculadoATurma, turmaIdsDoProfessor, turmaIdsDoResponsavel } = require('../lib/vinculos');

async function criar(req, res) {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'nome é obrigatório' });
  }

  const turma = await prisma.turma.create({ data: { nome } });

  return res.status(201).json(turma);
}

async function listar(req, res) {
  const where = {};

  if (req.usuario.papel === 'PROFESSOR') {
    where.id = { in: await turmaIdsDoProfessor(req.usuario.id) };
  } else if (req.usuario.papel === 'RESPONSAVEL') {
    where.id = { in: await turmaIdsDoResponsavel(req.usuario.id) };
  }

  const turmas = await prisma.turma.findMany({
    where,
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

  if (req.usuario.papel === 'PROFESSOR') {
    const vinculado = await professorVinculadoATurma(req.usuario.id, id);

    if (!vinculado) {
      return res.status(403).json({ erro: 'Sem permissão para ver essa turma' });
    }
  } else if (req.usuario.papel === 'RESPONSAVEL') {
    const turmaIds = await turmaIdsDoResponsavel(req.usuario.id);

    if (!turmaIds.includes(id)) {
      return res.status(403).json({ erro: 'Sem permissão para ver essa turma' });
    }
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
