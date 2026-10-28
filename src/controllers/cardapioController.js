// src/controllers/cardapioController.js
// Cardápio único pra creche inteira, um item por dia da semana (seg-sex).
// Só ADMIN edita (garantido na rota); qualquer papel autenticado pode ver.

const prisma = require('../lib/prisma');

const DIAS_SEMANA = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA'];

async function listar(req, res) {
  const itens = await prisma.itemCardapio.findMany({ orderBy: { diaSemana: 'asc' } });

  return res.json(itens);
}

async function atualizar(req, res) {
  const { diaSemana } = req.params;
  const { cafe, almoco, lanche } = req.body;

  if (!DIAS_SEMANA.includes(diaSemana)) {
    return res.status(400).json({ erro: 'diaSemana deve ser SEGUNDA, TERCA, QUARTA, QUINTA ou SEXTA' });
  }

  const item = await prisma.itemCardapio.upsert({
    where: { diaSemana },
    update: { cafe, almoco, lanche },
    create: { diaSemana, cafe, almoco, lanche },
  });

  return res.json(item);
}

module.exports = { listar, atualizar };
