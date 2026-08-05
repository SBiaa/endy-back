// src/controllers/presencaController.js
// Presenca = chamada diária, 1 por aluno por dia (@@unique([alunoId, data])).
// Mesmo padrão de autorização por vínculo do RegistroDiario.

const prisma = require('../lib/prisma');
const { professorVinculadoATurma, alunoIdsDoResponsavel, turmaIdsDoProfessor } = require('../lib/vinculos');

async function criar(req, res) {
  const { alunoId, data, status, motivo } = req.body;

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
    const presenca = await prisma.presenca.create({
      data: {
        alunoId,
        data,
        status,
        motivo,
        professorId: req.usuario.id,
      },
    });

    return res.status(201).json(presenca);
  } catch (erro) {
    if (erro.code === 'P2002') {
      return res.status(409).json({ erro: 'Já existe presença desse aluno nessa data' });
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
      return res.status(403).json({ erro: 'Sem permissão para ver presenças desse aluno' });
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
      return res.status(403).json({ erro: 'Sem permissão para ver presenças desse aluno' });
    }

    where.alunoId = alunoId || { in: alunoIds };
  } else if (alunoId) {
    where.alunoId = alunoId;
  }

  const presencas = await prisma.presenca.findMany({
    where,
    include: { professor: { select: { id: true, nome: true } } },
    orderBy: { data: 'desc' },
  });

  return res.json(presencas);
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { status, motivo } = req.body;

  const presenca = await prisma.presenca.findUnique({ where: { id } });

  if (!presenca) {
    return res.status(404).json({ erro: 'Presença não encontrada' });
  }

  if (req.usuario.papel === 'PROFESSOR') {
    const aluno = await prisma.aluno.findUnique({ where: { id: presenca.alunoId } });
    const vinculado = await professorVinculadoATurma(req.usuario.id, aluno.turmaId);

    if (!vinculado) {
      return res.status(403).json({ erro: 'Você não está vinculado à turma desse aluno' });
    }
  }

  const atualizada = await prisma.presenca.update({
    where: { id },
    data: { status, motivo },
  });

  return res.json(atualizada);
}

async function deletar(req, res) {
  const { id } = req.params;

  const presenca = await prisma.presenca.findUnique({ where: { id } });

  if (!presenca) {
    return res.status(404).json({ erro: 'Presença não encontrada' });
  }

  await prisma.presenca.delete({ where: { id } });

  return res.status(204).send();
}

// POST /presencas/lote — chamada da turma inteira de uma vez.
// Upsert por aluno: cria quem ainda não tem presença nessa data, atualiza
// quem já tem — evita o professor ter que resolver 409 aluno por aluno.
async function criarLote(req, res) {
  const { turmaId, data, registros } = req.body;

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!turma) {
    return res.status(404).json({ erro: 'Turma não encontrada' });
  }

  if (req.usuario.papel === 'PROFESSOR') {
    const vinculado = await professorVinculadoATurma(req.usuario.id, turmaId);

    if (!vinculado) {
      return res.status(403).json({ erro: 'Você não está vinculado a essa turma' });
    }
  }

  const alunosDaTurma = await prisma.aluno.findMany({
    where: { turmaId, id: { in: registros.map((registro) => registro.alunoId) } },
    select: { id: true },
  });
  const alunoIdsDaTurma = new Set(alunosDaTurma.map((aluno) => aluno.id));

  const alunoForaDaTurma = registros.some((registro) => !alunoIdsDaTurma.has(registro.alunoId));

  if (alunoForaDaTurma) {
    return res.status(400).json({ erro: 'Um ou mais alunos não pertencem a essa turma' });
  }

  const presencas = await prisma.$transaction(
    registros.map((registro) =>
      prisma.presenca.upsert({
        where: { alunoId_data: { alunoId: registro.alunoId, data } },
        update: { status: registro.status, motivo: registro.motivo ?? null },
        create: {
          alunoId: registro.alunoId,
          data,
          status: registro.status,
          motivo: registro.motivo ?? null,
          professorId: req.usuario.id,
        },
      })
    )
  );

  return res.status(200).json(presencas);
}

module.exports = { criar, listar, atualizar, deletar, criarLote };
