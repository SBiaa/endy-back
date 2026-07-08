// prisma/seed.js
// Roda uma vez pra criar o primeiro admin. Depois disso, o próprio admin
// cria os outros usuários (professor/responsável) pela aplicação.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const senhaPlana = 'admin123'; // troque depois do primeiro login, se quiser
  const senhaHash = await bcrypt.hash(senhaPlana, 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@agenda.com' },
    update: {}, // se já existir, não faz nada
    create: {
      nome: 'Admin',
      email: 'admin@agenda.com',
      senhaHash,
      papel: 'ADMIN',
    },
  });

  console.log('Admin criado/confirmado:', admin.email);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });