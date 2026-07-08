// src/controllers/publicacaoController.js
// Publicacao = feed + recados (mesma entidade, diferenciada por `tipo`).
// A consistência tipo<->campo não é travada no schema, então é validada aqui.

const prisma = require('../lib/prisma');
const { professorVinculadoATurma, alunoIdsDoResponsavel, turmaIdsDoProfessor } = require('../lib/vinculos');

const TIPOS_VALIDOS = ['GERAL', 'TURMA', 'INDIVIDUAL'];

function validarConsistenciaTipo(tipo, turmaId, alunoId) {
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return 'tipo deve ser GERAL, TURMA ou INDIVIDUAL';
  }

  if (tipo === 'GERAL' && (turmaId || alunoId)) {
    return 'tipo GERAL não deve ter turmaId nem alunoId';
  }

  if (tipo === 'TURMA') {
    if (!turmaId) return 'tipo TURMA exige turmaId';
    if (alunoId) return 'tipo TURMA não deve ter alunoId';
  }

  if (tipo === 'INDIVIDUAL') {
    if (!alunoId) return 'tipo INDIVIDUAL exige alunoId';
    if (turmaId) return 'tipo INDIVIDUAL não deve ter turmaId';
  }

  return null;
}

async function criar(req, res) {
  const { tipo, conteudo, turmaId, alunoId } = req.body;

  if (!conteudo) {
    return res.status(400).json({ erro: 'conteudo é obrigatório' });
  }

  const erroConsistencia = validarConsistenciaTipo(tipo, turmaId, alunoId);

  if (erroConsistencia) {
    return res.status(400).json({ erro: erroConsistencia });
  }

  let aluno;

  if (tipo === 'TURMA') {
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

    if (!turma) {
      return res.status(404).json({ erro: 'Turma não encontrada' });
    }
  }

  if (tipo === 'INDIVIDUAL') {
    aluno = await prisma.aluno.findUnique({ where: { id: alunoId } });

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }
  }

  if (req.usuario.papel === 'PROFESSOR') {
    if (tipo === 'TURMA') {
      const vinculado = await professorVinculadoATurma(req.usuario.id, turmaId);

      if (!vinculado) {
        return res.status(403).json({ erro: 'Você não está vinculado a essa turma' });
      }
    }

    if (tipo === 'INDIVIDUAL') {
      const vinculado = await professorVinculadoATurma(req.usuario.id, aluno.turmaId);

      if (!vinculado) {
        return res.status(403).json({ erro: 'Você não está vinculado à turma desse aluno' });
      }
    }
  }

  const publicacao = await prisma.publicacao.create({
    data: {
      tipo,
      conteudo,
      turmaId: tipo === 'TURMA' ? turmaId : null,
      alunoId: tipo === 'INDIVIDUAL' ? alunoId : null,
      autorId: req.usuario.id,
    },
  });

  return res.status(201).json(publicacao);
}

async function listar(req, res) {
  const { turmaId, alunoId, tipo } = req.query;
  const where = {};

  if (tipo) where.tipo = tipo;

  if (req.usuario.papel === 'RESPONSAVEL') {
    const alunoIds = await alunoIdsDoResponsavel(req.usuario.id);
    const alunos = await prisma.aluno.findMany({
      where: { id: { in: alunoIds } },
      select: { turmaId: true },
    });
    const turmaIds = [...new Set(alunos.map((a) => a.turmaId))];

    if (turmaId && !turmaIds.includes(turmaId)) {
      return res.status(403).json({ erro: 'Sem permissão para ver publicações dessa turma' });
    }

    if (alunoId && !alunoIds.includes(alunoId)) {
      return res.status(403).json({ erro: 'Sem permissão para ver publicações desse aluno' });
    }

    if (turmaId || alunoId) {
      // filtro explícito: restringe de verdade, não mistura com o resto do escopo permitido
      if (turmaId) where.turmaId = turmaId;
      if (alunoId) where.alunoId = alunoId;
    } else {
      // sem filtro: mostra tudo que ele tem permissão de ver (o "feed" dele)
      where.OR = [
        { tipo: 'GERAL' },
        { tipo: 'TURMA', turmaId: { in: turmaIds } },
        { tipo: 'INDIVIDUAL', alunoId: { in: alunoIds } },
      ];
    }
  } else if (req.usuario.papel === 'PROFESSOR') {
    const turmaIds = await turmaIdsDoProfessor(req.usuario.id);
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: { in: turmaIds } },
      select: { id: true },
    });
    const alunoIds = alunos.map((a) => a.id);

    if (turmaId && !turmaIds.includes(turmaId)) {
      return res.status(403).json({ erro: 'Sem permissão para ver publicações dessa turma' });
    }

    if (alunoId && !alunoIds.includes(alunoId)) {
      return res.status(403).json({ erro: 'Sem permissão para ver publicações desse aluno' });
    }

    if (turmaId || alunoId) {
      if (turmaId) where.turmaId = turmaId;
      if (alunoId) where.alunoId = alunoId;
    } else {
      where.OR = [
        { tipo: 'GERAL' },
        { tipo: 'TURMA', turmaId: { in: turmaIds } },
        { tipo: 'INDIVIDUAL', alunoId: { in: alunoIds } },
      ];
    }
  } else {
    // ADMIN: sem restrição
    if (turmaId) where.turmaId = turmaId;
    if (alunoId) where.alunoId = alunoId;
  }

  const publicacoes = await prisma.publicacao.findMany({
    where,
    include: { autor: { select: { id: true, nome: true, papel: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(publicacoes);
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { conteudo } = req.body;

  const publicacao = await prisma.publicacao.findUnique({ where: { id } });

  if (!publicacao) {
    return res.status(404).json({ erro: 'Publicação não encontrada' });
  }

  const podeEditar = publicacao.autorId === req.usuario.id || req.usuario.papel === 'ADMIN';

  if (!podeEditar) {
    return res.status(403).json({ erro: 'Sem permissão para editar essa publicação' });
  }

  if (!conteudo) {
    return res.status(400).json({ erro: 'conteudo é obrigatório' });
  }

  const atualizada = await prisma.publicacao.update({ where: { id }, data: { conteudo } });

  return res.json(atualizada);
}

async function deletar(req, res) {
  const { id } = req.params;

  const publicacao = await prisma.publicacao.findUnique({ where: { id } });

  if (!publicacao) {
    return res.status(404).json({ erro: 'Publicação não encontrada' });
  }

  const podeDeletar = publicacao.autorId === req.usuario.id || req.usuario.papel === 'ADMIN';

  if (!podeDeletar) {
    return res.status(403).json({ erro: 'Sem permissão para deletar essa publicação' });
  }

  await prisma.publicacao.delete({ where: { id } });

  return res.status(204).send();
}

module.exports = { criar, listar, atualizar, deletar };
