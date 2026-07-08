// src/lib/vinculos.js
// Helpers de autorização compartilhados entre controllers, pra não duplicar
// as mesmas queries de vínculo em cada lugar que precisa checar.

const prisma = require('./prisma');

async function professorVinculadoATurma(professorId, turmaId) {
  const turma = await prisma.turma.findFirst({
    where: { id: turmaId, professores: { some: { id: professorId } } },
  });

  return !!turma;
}

async function alunoIdsDoResponsavel(responsavelId) {
  const vinculos = await prisma.responsavelAluno.findMany({
    where: { responsavelId },
    select: { alunoId: true },
  });

  return vinculos.map((v) => v.alunoId);
}

async function turmaIdsDoProfessor(professorId) {
  const turmas = await prisma.turma.findMany({
    where: { professores: { some: { id: professorId } } },
    select: { id: true },
  });

  return turmas.map((t) => t.id);
}

async function turmaIdsDoResponsavel(responsavelId) {
  const alunoIds = await alunoIdsDoResponsavel(responsavelId);
  const alunos = await prisma.aluno.findMany({
    where: { id: { in: alunoIds } },
    select: { turmaId: true },
  });

  return [...new Set(alunos.map((a) => a.turmaId))];
}

module.exports = {
  professorVinculadoATurma,
  alunoIdsDoResponsavel,
  turmaIdsDoProfessor,
  turmaIdsDoResponsavel,
};
