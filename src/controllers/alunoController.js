// src/controllers/alunoController.js
// CRUD de Aluno. Escrita (criar/atualizar/deletar) é ADMIN-only (garantido na rota).
// Leitura é liberada pra qualquer papel logado, mas escopada por vínculo.

const prisma = require('../lib/prisma');
const { professorVinculadoATurma, alunoIdsDoResponsavel, turmaIdsDoProfessor } = require('../lib/vinculos');

async function criar(req, res) {
  const { nome, dataNascimento, alergias, observacoes, turmaId } = req.body;

  if (!nome || !dataNascimento || !turmaId) {
    return res.status(400).json({ erro: 'nome, dataNascimento e turmaId são obrigatórios' });
  }

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!turma) {
    return res.status(404).json({ erro: 'Turma não encontrada' });
  }

  const aluno = await prisma.aluno.create({
    data: {
      nome,
      dataNascimento: new Date(dataNascimento),
      alergias,
      observacoes,
      turmaId,
    },
  });

  return res.status(201).json(aluno);
}

async function listar(req, res) {
  const { turmaId } = req.query;
  const where = {};

  if (req.usuario.papel === 'PROFESSOR') {
    const turmaIds = await turmaIdsDoProfessor(req.usuario.id);

    if (turmaId && !turmaIds.includes(turmaId)) {
      return res.status(403).json({ erro: 'Sem permissão para ver alunos dessa turma' });
    }

    where.turmaId = turmaId || { in: turmaIds };
  } else if (req.usuario.papel === 'RESPONSAVEL') {
    const alunoIds = await alunoIdsDoResponsavel(req.usuario.id);

    where.id = { in: alunoIds };
    if (turmaId) where.turmaId = turmaId;
  } else if (turmaId) {
    where.turmaId = turmaId;
  }

  const alunos = await prisma.aluno.findMany({
    where,
    include: { turma: true },
    orderBy: { nome: 'asc' },
  });

  return res.json(alunos);
}

async function buscarPorId(req, res) {
  const { id } = req.params;

  const aluno = await prisma.aluno.findUnique({
    where: { id },
    include: { turma: true, responsaveis: true },
  });

  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  if (req.usuario.papel === 'PROFESSOR') {
    const vinculado = await professorVinculadoATurma(req.usuario.id, aluno.turmaId);

    if (!vinculado) {
      return res.status(403).json({ erro: 'Sem permissão para ver esse aluno' });
    }
  } else if (req.usuario.papel === 'RESPONSAVEL') {
    const alunoIds = await alunoIdsDoResponsavel(req.usuario.id);

    if (!alunoIds.includes(id)) {
      return res.status(403).json({ erro: 'Sem permissão para ver esse aluno' });
    }
  }

  return res.json(aluno);
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, dataNascimento, alergias, observacoes, turmaId } = req.body;

  const alunoExistente = await prisma.aluno.findUnique({ where: { id } });

  if (!alunoExistente) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  if (turmaId) {
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

    if (!turma) {
      return res.status(404).json({ erro: 'Turma não encontrada' });
    }
  }

  const aluno = await prisma.aluno.update({
    where: { id },
    data: {
      nome,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
      alergias,
      observacoes,
      turmaId,
    },
  });

  return res.json(aluno);
}

async function deletar(req, res) {
  const { id } = req.params;

  const alunoExistente = await prisma.aluno.findUnique({ where: { id } });

  if (!alunoExistente) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  try {
    await prisma.aluno.delete({ where: { id } });
  } catch (erro) {
    if (erro.code === 'P2003') {
      return res
        .status(400)
        .json({ erro: 'Não é possível excluir: este aluno possui publicações ou registros diários associados.' });
    }

    throw erro;
  }

  return res.status(204).send();
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar };
