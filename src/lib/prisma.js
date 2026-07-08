// src/lib/prisma.js
// Instância única do Prisma Client, reaproveitada em todo o projeto.
// Importa daqui sempre: const prisma = require('./lib/prisma');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;