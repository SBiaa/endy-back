// src/controllers/professorTurmaController.js
// Vínculo Professor <-> Turma (M2M implícito via Turma.professores), restrito a ADMIN.

const prisma = require('../lib/prisma');

async function vincular(req, res) {
  const { professorId, turmaId } = req.body;

  if (!professorId || !turmaId) {
    return res.status(400).json({ erro: 'professorId e turmaId são obrigatórios' });
  }

  const professor = await prisma.usuario.findUnique({ where: { id: professorId } });

  if (!professor || professor.papel !== 'PROFESSOR') {
    return res.status(404).json({ erro: 'Professor não encontrado' });
  }

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!turma) {
    return res.status(404).json({ erro: 'Turma não encontrada' });
  }

  const turmaAtualizada = await prisma.turma.update({
    where: { id: turmaId },
    data: { professores: { connect: { id: professorId } } },
    include: {
      professores: {
        select: { id: true, nome: true, email: true, papel: true },
      },
    },
  });

  return res.status(201).json(turmaAtualizada);
}

async function desvincular(req, res) {
  const { turmaId, professorId } = req.params;

  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!turma) {
    return res.status(404).json({ erro: 'Turma não encontrada' });
  }

  const professor = await prisma.usuario.findUnique({ where: { id: professorId } });

  if (!professor) {
    return res.status(404).json({ erro: 'Professor não encontrado' });
  }

  await prisma.turma.update({
    where: { id: turmaId },
    data: { professores: { disconnect: { id: professorId } } },
  });

  return res.status(204).send();
}

module.exports = { vincular, desvincular };
