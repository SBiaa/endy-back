// src/controllers/dashboardController.js
// Endpoint agregado pro dashboard do Admin. Uma função por bloco,
// rodadas em paralelo em admin() e devolvidas consolidadas.

const prisma = require('../lib/prisma');

async function contagens() {
  const [turmas, alunos, professores, responsaveis] = await Promise.all([
    prisma.turma.count(),
    prisma.aluno.count(),
    prisma.usuario.count({ where: { papel: 'PROFESSOR' } }),
    prisma.usuario.count({ where: { papel: 'RESPONSAVEL' } }),
  ]);

  return { turmas, alunos, professores, responsaveis };
}

async function turmasSemRegistroHoje() {
  const hoje = new Date();
  const dataHoje = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));

  return prisma.turma.findMany({
    where: {
      AND: [
        { alunos: { some: {} } },
        { alunos: { every: { registrosDiario: { none: { data: dataHoje } } } } },
      ],
    },
    select: { id: true, nome: true },
  });
}

async function aniversariantesDoMes() {
  // Prisma não tem operador nativo pra extrair mês/dia de uma data;
  // trazemos os alunos e filtramos/ordenamos em memória em vez de usar
  // $queryRaw com EXTRACT (específico de Postgres, e nada mais no
  // projeto usa SQL bruto).
  const todosAlunos = await prisma.aluno.findMany({
    select: { id: true, nome: true, dataNascimento: true },
  });

  const mesAtual = new Date().getUTCMonth();

  return todosAlunos
    .filter((aluno) => aluno.dataNascimento.getUTCMonth() === mesAtual)
    .sort((a, b) => a.dataNascimento.getUTCDate() - b.dataNascimento.getUTCDate());
}

async function ultimasPublicacoes() {
  return prisma.publicacao.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { autor: { select: { nome: true } } },
  });
}

async function professoresInativos() {
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  return prisma.usuario.findMany({
    where: {
      papel: 'PROFESSOR',
      publicacoes: { none: { createdAt: { gte: seteDiasAtras } } },
    },
    select: { id: true, nome: true },
  });
}

async function alunosPorTurma() {
  const turmas = await prisma.turma.findMany({
    select: {
      id: true,
      nome: true,
      _count: { select: { alunos: true } },
    },
  });

  return turmas.map((turma) => ({
    turmaId: turma.id,
    nomeTurma: turma.nome,
    totalAlunos: turma._count.alunos,
  }));
}

async function admin(req, res) {
  try {
    const [
      contagensResultado,
      turmasSemRegistroHojeResultado,
      aniversariantesDoMesResultado,
      ultimasPublicacoesResultado,
      professoresInativosResultado,
      alunosPorTurmaResultado,
    ] = await Promise.all([
      contagens(),
      turmasSemRegistroHoje(),
      aniversariantesDoMes(),
      ultimasPublicacoes(),
      professoresInativos(),
      alunosPorTurma(),
    ]);

    return res.json({
      contagens: contagensResultado,
      turmasSemRegistroHoje: turmasSemRegistroHojeResultado,
      aniversariantesDoMes: aniversariantesDoMesResultado,
      ultimasPublicacoes: ultimasPublicacoesResultado,
      professoresInativos: professoresInativosResultado,
      alunosPorTurma: alunosPorTurmaResultado,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao carregar dashboard' });
  }
}

module.exports = { admin };
