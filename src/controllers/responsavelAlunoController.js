// src/controllers/responsavelAlunoController.js
// Vínculo Responsavel <-> Aluno (join explícito ResponsavelAluno), restrito a ADMIN.

const prisma = require('../lib/prisma');

async function vincular(req, res) {
  const { responsavelId, alunoId, parentesco } = req.body;

  if (!responsavelId || !alunoId) {
    return res.status(400).json({ erro: 'responsavelId e alunoId são obrigatórios' });
  }

  const responsavel = await prisma.usuario.findUnique({ where: { id: responsavelId } });

  if (!responsavel || responsavel.papel !== 'RESPONSAVEL') {
    return res.status(404).json({ erro: 'Responsável não encontrado' });
  }

  const aluno = await prisma.aluno.findUnique({ where: { id: alunoId } });

  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  try {
    const vinculo = await prisma.responsavelAluno.create({
      data: { responsavelId, alunoId, parentesco },
    });

    return res.status(201).json(vinculo);
  } catch (erro) {
    if (erro.code === 'P2002') {
      return res.status(409).json({ erro: 'Vínculo já existe' });
    }

    throw erro;
  }
}

async function desvincular(req, res) {
  const { id } = req.params;

  const vinculo = await prisma.responsavelAluno.findUnique({ where: { id } });

  if (!vinculo) {
    return res.status(404).json({ erro: 'Vínculo não encontrado' });
  }

  await prisma.responsavelAluno.delete({ where: { id } });

  return res.status(204).send();
}

module.exports = { vincular, desvincular };
