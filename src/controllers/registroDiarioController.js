// src/controllers/registroDiarioController.js
// RegistroDiario = o form pré-setado, 1 por aluno por dia (@@unique([alunoId, data])).

const prisma = require('../lib/prisma');
const { professorVinculadoATurma, alunoIdsDoResponsavel, turmaIdsDoProfessor } = require('../lib/vinculos');

async function criar(req, res) {
  const {
    alunoId,
    data,
    humor,
    cafe,
    almoco,
    lanche,
    sono,
    trocasFralda,
    evacuou,
    atividades,
    materiaisNecessarios,
    observacoes,
  } = req.body;

  if (!alunoId || !data || !humor || !sono) {
    return res.status(400).json({ erro: 'alunoId, data, humor e sono são obrigatórios' });
  }

  const aluno = await prisma.aluno.findUnique({ where: { id: alunoId } });

  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  if (req.usuario.papel === 'PROFESSOR') {
    const vinculado = await professorVinculadoATurma(req.usuario.id, aluno.turmaId);

    if (!vinculado) {
      return res.status(403).json({ erro: 'Você não está vinculado à turma desse aluno' });
    }
  }

  try {
    const registro = await prisma.registroDiario.create({
      data: {
        alunoId,
        data: new Date(data),
        humor,
        cafe,
        almoco,
        lanche,
        sono,
        trocasFralda,
        evacuou,
        atividades,
        materiaisNecessarios,
        observacoes,
        professorId: req.usuario.id,
      },
    });

    return res.status(201).json(registro);
  } catch (erro) {
    if (erro.code === 'P2002') {
      return res.status(409).json({ erro: 'Já existe registro desse aluno nessa data' });
    }

    throw erro;
  }
}

async function listar(req, res) {
  const { alunoId, data } = req.query;
  const where = {};

  if (data) where.data = new Date(data);

  if (req.usuario.papel === 'RESPONSAVEL') {
    const alunoIds = await alunoIdsDoResponsavel(req.usuario.id);

    if (alunoId && !alunoIds.includes(alunoId)) {
      return res.status(403).json({ erro: 'Sem permissão para ver registros desse aluno' });
    }

    where.alunoId = alunoId || { in: alunoIds };
  } else if (req.usuario.papel === 'PROFESSOR') {
    const turmaIds = await turmaIdsDoProfessor(req.usuario.id);
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: { in: turmaIds } },
      select: { id: true },
    });
    const alunoIds = alunos.map((a) => a.id);

    if (alunoId && !alunoIds.includes(alunoId)) {
      return res.status(403).json({ erro: 'Sem permissão para ver registros desse aluno' });
    }

    where.alunoId = alunoId || { in: alunoIds };
  } else if (alunoId) {
    where.alunoId = alunoId;
  }

  const registros = await prisma.registroDiario.findMany({
    where,
    include: { professor: { select: { id: true, nome: true } } },
    orderBy: { data: 'desc' },
  });

  return res.json(registros);
}

async function atualizar(req, res) {
  const { id } = req.params;
  const {
    humor,
    cafe,
    almoco,
    lanche,
    sono,
    trocasFralda,
    evacuou,
    atividades,
    materiaisNecessarios,
    observacoes,
  } = req.body;

  const registro = await prisma.registroDiario.findUnique({ where: { id } });

  if (!registro) {
    return res.status(404).json({ erro: 'Registro não encontrado' });
  }

  if (req.usuario.papel === 'PROFESSOR') {
    const aluno = await prisma.aluno.findUnique({ where: { id: registro.alunoId } });
    const vinculado = await professorVinculadoATurma(req.usuario.id, aluno.turmaId);

    if (!vinculado) {
      return res.status(403).json({ erro: 'Você não está vinculado à turma desse aluno' });
    }
  }

  const atualizado = await prisma.registroDiario.update({
    where: { id },
    data: {
      humor,
      cafe,
      almoco,
      lanche,
      sono,
      trocasFralda,
      evacuou,
      atividades,
      materiaisNecessarios,
      observacoes,
    },
  });

  return res.json(atualizado);
}

async function deletar(req, res) {
  const { id } = req.params;

  const registro = await prisma.registroDiario.findUnique({ where: { id } });

  if (!registro) {
    return res.status(404).json({ erro: 'Registro não encontrado' });
  }

  await prisma.registroDiario.delete({ where: { id } });

  return res.status(204).send();
}

module.exports = { criar, listar, atualizar, deletar };
