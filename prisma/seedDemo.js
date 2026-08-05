// prisma/seedDemo.js
// Popula o banco com um dataset fictício maior pra testar a aplicação:
// 5 turmas, professores, responsáveis, alunos, vínculos, ~2 meses de
// registros diários (dias úteis) e publicações espalhadas no período.
//
// É "reset e reconstrói": no início apaga qualquer linha que pertença às
// turmas/emails listados abaixo (turmas, alunos, vínculos, registros e
// publicações associados) e recria tudo do zero. Roda quantas vezes quiser
// sem duplicar nem acumular lixo. Nunca toca em dados que você criou manualmente
// (outras turmas/usuários com nomes/emails diferentes dos daqui, nem o ADMIN).

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SENHA_DEMO = 'demo123';

const TURMA_NOMES = ['Berçário I', 'Berçário II', 'Maternal I', 'Maternal II', 'Jardim I'];

const EMAILS_PROFESSORES = [
  'ana.souza@agenda.com',
  'beatriz.nogueira@agenda.com',
  'carlos.lima@agenda.com',
  'rafael.torres@agenda.com',
];

const EMAILS_RESPONSAVEIS = [
  'fernanda.alves@agenda.com',
  'joao.pedro@agenda.com',
  'marcelo.ramos@agenda.com',
  'patricia.gomes@agenda.com',
  'camila.rocha@agenda.com',
  'eduardo.santos@agenda.com',
  'juliana.pires@agenda.com',
  'roberto.dias@agenda.com',
];

const HUMORES = ['OTIMO', 'BOM', 'AGITADO', 'CHOROSO', 'ADOECIDO'];
const SONOS = ['DORMIU_BEM', 'DORMIU_POUCO', 'AGITADO', 'NAO_DORMIU'];
const REFEICOES = ['TUDO', 'METADE', 'POUCO', 'RECUSOU'];

const ATIVIDADES = [
  'Pintura com dedo e roda de música',
  'Contação de história e brincadeira no parquinho',
  'Circuito motor com bambolês e cones',
  'Massinha caseira e blocos de encaixe',
  'Passeio no jardim e observação de plantas',
];

const OBSERVACOES = [
  'Passou o dia bem disposto(a).',
  'Um pouco resfriado(a), ficou mais quieto(a) hoje.',
  'Brincou bastante com os coleguinhas.',
  'Chorou um pouco na chegada, mas se acalmou rápido.',
  'Comeu tudo com bastante apetite hoje.',
];

const MATERIAIS = [
  'Está acabando a fralda',
  'Precisa trazer troca de roupa',
  'Está acabando o lenço umedecido',
  'Precisa de protetor solar',
];

function aleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function aleatorioInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function diaUTC(ano, mes, dia) {
  return new Date(Date.UTC(ano, mes, dia));
}

function somarDias(data, dias) {
  const resultado = new Date(data);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

function ehFimDeSemana(data) {
  const diaSemana = data.getUTCDay();
  return diaSemana === 0 || diaSemana === 6;
}

function comHorarioAleatorio(dataBase) {
  const resultado = new Date(dataBase);
  resultado.setUTCHours(aleatorioInt(8, 18), aleatorioInt(0, 59), 0, 0);
  return resultado;
}

async function limparSeedAnterior() {
  const turmas = await prisma.turma.findMany({
    where: { nome: { in: TURMA_NOMES } },
    select: { id: true },
  });
  const turmaIds = turmas.map((t) => t.id);

  const alunos = await prisma.aluno.findMany({
    where: { turmaId: { in: turmaIds } },
    select: { id: true },
  });
  const alunoIds = alunos.map((a) => a.id);

  const usuarios = await prisma.usuario.findMany({
    where: { email: { in: [...EMAILS_PROFESSORES, ...EMAILS_RESPONSAVEIS] } },
    select: { id: true },
  });
  const usuarioIds = usuarios.map((u) => u.id);

  await prisma.registroDiario.deleteMany({ where: { alunoId: { in: alunoIds } } });
  await prisma.publicacao.deleteMany({
    where: {
      OR: [
        { turmaId: { in: turmaIds } },
        { alunoId: { in: alunoIds } },
        { autorId: { in: usuarioIds } },
      ],
    },
  });
  await prisma.responsavelAluno.deleteMany({ where: { alunoId: { in: alunoIds } } });
  await prisma.aluno.deleteMany({ where: { id: { in: alunoIds } } });
  await prisma.usuario.deleteMany({ where: { id: { in: usuarioIds } } });
  await prisma.turma.deleteMany({ where: { id: { in: turmaIds } } });
}

async function main() {
  await limparSeedAnterior();

  const admin = await prisma.usuario.findUnique({ where: { email: 'admin@agenda.com' } });

  if (!admin) {
    throw new Error('Rode "node prisma/seed.js" primeiro pra criar o ADMIN.');
  }

  const senhaHash = await bcrypt.hash(SENHA_DEMO, 10);

  // ---------- turmas ----------
  const [bercarioI, bercarioII, maternalI, maternalII, jardimI] = await Promise.all(
    TURMA_NOMES.map((nome) => prisma.turma.create({ data: { nome } }))
  );

  // ---------- professores ----------
  const anaSouza = await prisma.usuario.create({
    data: {
      nome: 'Ana Souza',
      email: 'ana.souza@agenda.com',
      senhaHash,
      papel: 'PROFESSOR',
      turmas: { connect: [{ id: bercarioI.id }, { id: bercarioII.id }] },
    },
  });
  const beatrizNogueira = await prisma.usuario.create({
    data: {
      nome: 'Beatriz Nogueira',
      email: 'beatriz.nogueira@agenda.com',
      senhaHash,
      papel: 'PROFESSOR',
      turmas: { connect: [{ id: maternalI.id }] },
    },
  });
  const carlosLima = await prisma.usuario.create({
    data: {
      nome: 'Carlos Lima',
      email: 'carlos.lima@agenda.com',
      senhaHash,
      papel: 'PROFESSOR',
      turmas: { connect: [{ id: maternalII.id }] },
    },
  });
  const rafaelTorres = await prisma.usuario.create({
    data: {
      nome: 'Rafael Torres',
      email: 'rafael.torres@agenda.com',
      senhaHash,
      papel: 'PROFESSOR',
      turmas: { connect: [{ id: jardimI.id }] },
    },
  });

  // ---------- responsáveis ----------
  const nomesResponsaveis = [
    'Fernanda Alves',
    'João Pedro',
    'Marcelo Ramos',
    'Patrícia Gomes',
    'Camila Rocha',
    'Eduardo Santos',
    'Juliana Pires',
    'Roberto Dias',
  ];
  const [fernanda, joaoPedro, marcelo, patricia, camila, eduardo, juliana, roberto] =
    await Promise.all(
      nomesResponsaveis.map((nome, i) =>
        prisma.usuario.create({
          data: { nome, email: EMAILS_RESPONSAVEIS[i], senhaHash, papel: 'RESPONSAVEL' },
        })
      )
    );

  // ---------- alunos ----------
  // turma -> professor responsável pelos registros diários dessa turma
  const professorDaTurma = new Map([
    [bercarioI.id, anaSouza],
    [bercarioII.id, anaSouza],
    [maternalI.id, beatrizNogueira],
    [maternalII.id, carlosLima],
    [jardimI.id, rafaelTorres],
  ]);

  // datas de nascimento com dia em agosto (mês atual) marcadas pra testar
  // "aniversariantes do mês" — espalhadas entre as turmas
  const alunosDados = [
    { nome: 'Alice Souza', turma: bercarioI, dataNascimento: '2025-08-12', alergias: null },
    { nome: 'Bernardo Lima', turma: bercarioI, dataNascimento: '2026-02-20', alergias: 'Leite de vaca' },
    { nome: 'Sofia Martins', turma: bercarioI, dataNascimento: '2025-11-05', alergias: null },

    { nome: 'Davi Oliveira', turma: bercarioII, dataNascimento: '2024-08-25', observacoes: 'Usa óculos' },
    { nome: 'Helena Costa', turma: bercarioII, dataNascimento: '2024-12-14' },
    { nome: 'Miguel Rocha', turma: bercarioII, dataNascimento: '2025-03-30' },

    { nome: 'Elisa Fernandes', turma: maternalI, dataNascimento: '2023-08-03' },
    { nome: 'Pedro Santos', turma: maternalI, dataNascimento: '2023-10-18' },
    { nome: 'Laura Dias', turma: maternalI, dataNascimento: '2024-01-22' },

    { nome: 'Gabriel Costa', turma: maternalII, dataNascimento: '2022-11-30', alergias: 'Amendoim' },
    { nome: 'Isabela Pires', turma: maternalII, dataNascimento: '2022-08-19' },
    { nome: 'Lucas Andrade', turma: maternalII, dataNascimento: '2023-02-08' },

    { nome: 'Beatriz Ramos', turma: jardimI, dataNascimento: '2021-06-17' },
    { nome: 'Enzo Carvalho', turma: jardimI, dataNascimento: '2021-08-28' },
    { nome: 'Manuela Alves', turma: jardimI, dataNascimento: '2022-01-11' },
  ];

  const alunos = [];
  for (const dados of alunosDados) {
    const aluno = await prisma.aluno.create({
      data: {
        nome: dados.nome,
        dataNascimento: new Date(dados.dataNascimento),
        turmaId: dados.turma.id,
        alergias: dados.alergias ?? null,
        observacoes: dados.observacoes ?? null,
      },
    });
    alunos.push(aluno);
  }

  function alunoPorNome(nome) {
    return alunos.find((a) => a.nome === nome);
  }

  // ---------- vínculos responsável <-> aluno (alguns responsáveis com +1 filho) ----------
  await prisma.responsavelAluno.createMany({
    data: [
      { responsavelId: fernanda.id, alunoId: alunoPorNome('Alice Souza').id, parentesco: 'mãe' },
      { responsavelId: fernanda.id, alunoId: alunoPorNome('Elisa Fernandes').id, parentesco: 'mãe' },
      { responsavelId: joaoPedro.id, alunoId: alunoPorNome('Bernardo Lima').id, parentesco: 'pai' },
      { responsavelId: marcelo.id, alunoId: alunoPorNome('Gabriel Costa').id, parentesco: 'pai' },
      { responsavelId: marcelo.id, alunoId: alunoPorNome('Miguel Rocha').id, parentesco: 'pai' },
      { responsavelId: patricia.id, alunoId: alunoPorNome('Davi Oliveira').id, parentesco: 'mãe' },
      { responsavelId: camila.id, alunoId: alunoPorNome('Sofia Martins').id, parentesco: 'mãe' },
      { responsavelId: camila.id, alunoId: alunoPorNome('Helena Costa').id, parentesco: 'mãe' },
      { responsavelId: eduardo.id, alunoId: alunoPorNome('Pedro Santos').id, parentesco: 'pai' },
      { responsavelId: eduardo.id, alunoId: alunoPorNome('Laura Dias').id, parentesco: 'pai' },
      { responsavelId: juliana.id, alunoId: alunoPorNome('Isabela Pires').id, parentesco: 'mãe' },
      { responsavelId: juliana.id, alunoId: alunoPorNome('Lucas Andrade').id, parentesco: 'mãe' },
      { responsavelId: roberto.id, alunoId: alunoPorNome('Beatriz Ramos').id, parentesco: 'avô' },
      { responsavelId: roberto.id, alunoId: alunoPorNome('Enzo Carvalho').id, parentesco: 'pai' },
      { responsavelId: roberto.id, alunoId: alunoPorNome('Manuela Alves').id, parentesco: 'pai' },
    ],
    skipDuplicates: true,
  });

  // ---------- ~2 meses de registros diários (dias úteis) ----------
  const hoje = new Date();
  const dataHoje = diaUTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate());
  const dataInicio = somarDias(dataHoje, -60);

  const registros = [];

  for (let data = dataInicio; data <= dataHoje; data = somarDias(data, 1)) {
    if (ehFimDeSemana(data)) continue;

    const ehHoje = data.getTime() === dataHoje.getTime();

    for (const aluno of alunos) {
      // Jardim I fica sem registro hoje de propósito, pra aparecer no dashboard
      // em "turmas sem registro hoje"
      if (ehHoje && aluno.turmaId === jardimI.id) continue;

      // gaps ocasionais (falta, professor esqueceu de preencher etc.)
      if (Math.random() < 0.08) continue;

      const professor = professorDaTurma.get(aluno.turmaId);
      const ehBebe = aluno.turmaId === bercarioI.id || aluno.turmaId === bercarioII.id;

      registros.push({
        alunoId: aluno.id,
        professorId: professor.id,
        data,
        humor: aleatorio(HUMORES),
        sono: aleatorio(SONOS),
        cafe: aleatorio(REFEICOES),
        almoco: aleatorio(REFEICOES),
        lanche: aleatorio(REFEICOES),
        trocasFralda: ehBebe ? aleatorioInt(2, 6) : null,
        evacuou: ehBebe ? Math.random() < 0.6 : null,
        atividades: Math.random() < 0.3 ? aleatorio(ATIVIDADES) : null,
        observacoes: Math.random() < 0.25 ? aleatorio(OBSERVACOES) : null,
        materiaisNecessarios: Math.random() < 0.15 ? aleatorio(MATERIAIS) : null,
      });
    }
  }

  await prisma.registroDiario.createMany({ data: registros, skipDuplicates: true });

  // ---------- publicações espalhadas nos ~2 meses ----------
  // Rafael Torres só posta até 10 dias atrás — fica "inativo" nos últimos 7 dias
  // de propósito, pra aparecer em "professores inativos" no dashboard.
  const corteRafael = somarDias(dataHoje, -10);
  const professoresComTurma = [
    { professor: anaSouza, turma: bercarioI, alunosDaTurma: alunos.filter((a) => a.turmaId === bercarioI.id) },
    { professor: anaSouza, turma: bercarioII, alunosDaTurma: alunos.filter((a) => a.turmaId === bercarioII.id) },
    { professor: beatrizNogueira, turma: maternalI, alunosDaTurma: alunos.filter((a) => a.turmaId === maternalI.id) },
    { professor: carlosLima, turma: maternalII, alunosDaTurma: alunos.filter((a) => a.turmaId === maternalII.id) },
    { professor: rafaelTorres, turma: jardimI, alunosDaTurma: alunos.filter((a) => a.turmaId === jardimI.id) },
  ];

  const publicacoes = [];

  for (let data = dataInicio; data <= dataHoje; data = somarDias(data, 1)) {
    if (ehFimDeSemana(data)) continue;

    if (Math.random() < 0.1) {
      publicacoes.push({
        tipo: 'GERAL',
        conteudo: aleatorio([
          'Lembrete: reunião de pais na próxima semana.',
          'Campanha do agasalho até o fim do mês — traga uma peça!',
          'Semana que vem tem festa junina, capricha na roupa caipira 🎉',
          'A creche vai fechar mais cedo na sexta por conta da manutenção.',
        ]),
        autorId: admin.id,
        createdAt: comHorarioAleatorio(data),
      });
    }

    for (const { professor, turma, alunosDaTurma } of professoresComTurma) {
      if (professor.id === rafaelTorres.id && data > corteRafael) continue;
      if (Math.random() >= 0.3) continue;

      if (Math.random() < 0.7) {
        publicacoes.push({
          tipo: 'TURMA',
          conteudo: `${aleatorio(ATIVIDADES)}.`,
          autorId: professor.id,
          turmaId: turma.id,
          createdAt: comHorarioAleatorio(data),
        });
      } else {
        const aluno = aleatorio(alunosDaTurma);
        publicacoes.push({
          tipo: 'INDIVIDUAL',
          conteudo: `${aluno.nome.split(' ')[0]} ${aleatorio([
            'comeu super bem hoje!',
            'brincou bastante com os coleguinhas.',
            'dormiu tranquilo(a) na hora da soneca.',
            'participou super animado(a) da atividade de hoje.',
          ])}`,
          autorId: professor.id,
          alunoId: aluno.id,
          createdAt: comHorarioAleatorio(data),
        });
      }
    }
  }

  await prisma.publicacao.createMany({ data: publicacoes });

  console.log(`Turmas: ${TURMA_NOMES.length}`);
  console.log(`Professores: ${EMAILS_PROFESSORES.length}`);
  console.log(`Responsáveis: ${nomesResponsaveis.length}`);
  console.log(`Alunos: ${alunos.length}`);
  console.log(`Registros diários: ${registros.length}`);
  console.log(`Publicações: ${publicacoes.length}`);
  console.log(`Senha de todas as contas geradas: "${SENHA_DEMO}"`);
  console.log('Professor inativo de propósito (sem post nos últimos 7 dias): rafael.torres@agenda.com');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
