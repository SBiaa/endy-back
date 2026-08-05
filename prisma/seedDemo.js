// prisma/seedDemo.js
// Popula o banco com dados fictícios pra testar a aplicação (turmas, professores,
// responsáveis, alunos, vínculos, publicações e registros diários).
// Roda depois do prisma/seed.js (precisa do ADMIN só pra criar a publicação GERAL).
// Idempotente: se a turma "Berçário I" já existir, assume que o seed já rodou e sai.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SENHA_DEMO = 'demo123';

async function main() {
  const jaRodou = await prisma.turma.findFirst({ where: { nome: 'Berçário I' } });

  if (jaRodou) {
    console.log('Seed de demo já rodou antes (turma "Berçário I" existe) — nada a fazer.');
    return;
  }

  const admin = await prisma.usuario.findUnique({ where: { email: 'admin@agenda.com' } });

  if (!admin) {
    throw new Error('Rode "node prisma/seed.js" primeiro pra criar o ADMIN.');
  }

  const senhaHash = await bcrypt.hash(SENHA_DEMO, 10);

  // ---------- turmas ----------
  const [bercarioI, maternalI, jardimI] = await Promise.all([
    prisma.turma.create({ data: { nome: 'Berçário I' } }),
    prisma.turma.create({ data: { nome: 'Maternal I' } }),
    prisma.turma.create({ data: { nome: 'Jardim I' } }),
  ]);

  // ---------- professores ----------
  const anaSouza = await prisma.usuario.create({
    data: {
      nome: 'Ana Souza',
      email: 'ana.souza@agenda.com',
      senhaHash,
      papel: 'PROFESSOR',
      turmas: { connect: [{ id: bercarioI.id }, { id: maternalI.id }] },
    },
  });

  const carlosLima = await prisma.usuario.create({
    data: {
      nome: 'Carlos Lima',
      email: 'carlos.lima@agenda.com',
      senhaHash,
      papel: 'PROFESSOR',
      turmas: { connect: [{ id: jardimI.id }] },
    },
  });

  // ---------- responsáveis ----------
  const [fernanda, joaoPedro, marcelo, patricia] = await Promise.all([
    prisma.usuario.create({
      data: { nome: 'Fernanda Alves', email: 'fernanda.alves@agenda.com', senhaHash, papel: 'RESPONSAVEL' },
    }),
    prisma.usuario.create({
      data: { nome: 'João Pedro', email: 'joao.pedro@agenda.com', senhaHash, papel: 'RESPONSAVEL' },
    }),
    prisma.usuario.create({
      data: { nome: 'Marcelo Ramos', email: 'marcelo.ramos@agenda.com', senhaHash, papel: 'RESPONSAVEL' },
    }),
    prisma.usuario.create({
      data: { nome: 'Patrícia Gomes', email: 'patricia.gomes@agenda.com', senhaHash, papel: 'RESPONSAVEL' },
    }),
  ]);

  // ---------- alunos ----------
  // datas de nascimento de Alice e Davi caem no mês atual, pra testar "aniversariantes do mês"
  const alice = await prisma.aluno.create({
    data: {
      nome: 'Alice Souza',
      dataNascimento: new Date('2025-08-12'),
      turmaId: bercarioI.id,
    },
  });
  const bernardo = await prisma.aluno.create({
    data: {
      nome: 'Bernardo Lima',
      dataNascimento: new Date('2025-02-20'),
      alergias: 'Leite de vaca',
      turmaId: bercarioI.id,
    },
  });
  const clara = await prisma.aluno.create({
    data: {
      nome: 'Clara Martins',
      dataNascimento: new Date('2024-03-10'),
      turmaId: maternalI.id,
    },
  });
  const davi = await prisma.aluno.create({
    data: {
      nome: 'Davi Oliveira',
      dataNascimento: new Date('2023-08-25'),
      observacoes: 'Usa óculos',
      turmaId: maternalI.id,
    },
  });
  const elisa = await prisma.aluno.create({
    data: {
      nome: 'Elisa Fernandes',
      dataNascimento: new Date('2022-05-14'),
      turmaId: jardimI.id,
    },
  });
  const gabriel = await prisma.aluno.create({
    data: {
      nome: 'Gabriel Costa',
      dataNascimento: new Date('2021-11-30'),
      alergias: 'Amendoim',
      turmaId: jardimI.id,
    },
  });

  // ---------- vínculos responsável <-> aluno ----------
  await prisma.responsavelAluno.createMany({
    data: [
      { responsavelId: fernanda.id, alunoId: alice.id, parentesco: 'mãe' },
      { responsavelId: fernanda.id, alunoId: elisa.id, parentesco: 'mãe' },
      { responsavelId: joaoPedro.id, alunoId: bernardo.id, parentesco: 'pai' },
      { responsavelId: marcelo.id, alunoId: clara.id, parentesco: 'pai' },
      { responsavelId: marcelo.id, alunoId: gabriel.id, parentesco: 'pai' },
      { responsavelId: patricia.id, alunoId: davi.id, parentesco: 'mãe' },
    ],
  });

  // ---------- registros diários de hoje ----------
  // Berçário I e Maternal I ficam com registro hoje; Jardim I fica sem,
  // pra aparecer em "turmas sem registro hoje" no dashboard.
  const hoje = new Date();
  const dataHoje = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));

  await prisma.registroDiario.createMany({
    data: [
      {
        alunoId: alice.id,
        professorId: anaSouza.id,
        data: dataHoje,
        humor: 'BOM',
        sono: 'DORMIU_BEM',
        cafe: 'TUDO',
        almoco: 'METADE',
        trocasFralda: 4,
        evacuou: true,
      },
      {
        alunoId: bernardo.id,
        professorId: anaSouza.id,
        data: dataHoje,
        humor: 'AGITADO',
        sono: 'DORMIU_POUCO',
        cafe: 'POUCO',
        trocasFralda: 3,
        evacuou: false,
        observacoes: 'Choroso na hora da soneca, mas passou.',
      },
      {
        alunoId: clara.id,
        professorId: anaSouza.id,
        data: dataHoje,
        humor: 'OTIMO',
        sono: 'DORMIU_BEM',
        almoco: 'TUDO',
        lanche: 'TUDO',
        atividades: 'Pintura com dedo e roda de música',
      },
      {
        alunoId: davi.id,
        professorId: anaSouza.id,
        data: dataHoje,
        humor: 'BOM',
        sono: 'DORMIU_BEM',
        almoco: 'METADE',
        materiaisNecessarios: 'Está acabando o lenço umedecido',
      },
    ],
  });

  // ---------- publicações ----------
  await prisma.publicacao.create({
    data: {
      tipo: 'GERAL',
      conteudo: 'Bem-vindos ao novo semestre! Qualquer dúvida, fale com a coordenação.',
      autorId: admin.id,
    },
  });
  await prisma.publicacao.create({
    data: {
      tipo: 'TURMA',
      conteudo: 'Turma de hoje: brincadeiras sensoriais com massinha caseira.',
      autorId: anaSouza.id,
      turmaId: bercarioI.id,
    },
  });
  await prisma.publicacao.create({
    data: {
      tipo: 'INDIVIDUAL',
      conteudo: 'Elisa comeu super bem hoje e brincou bastante no parquinho!',
      autorId: carlosLima.id,
      alunoId: elisa.id,
    },
  });
  await prisma.publicacao.create({
    data: {
      tipo: 'TURMA',
      conteudo: 'Precisamos de doações de potinhos vazios (iogurte/requeijão) para reciclagem.',
      autorId: carlosLima.id,
      turmaId: jardimI.id,
    },
  });

  console.log('Seed de demo criado com sucesso.');
  console.log(`Login de professores/responsáveis: senha "${SENHA_DEMO}" para todos.`);
  console.log(
    'Emails:',
    [anaSouza, carlosLima, fernanda, joaoPedro, marcelo, patricia].map((u) => u.email).join(', ')
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
