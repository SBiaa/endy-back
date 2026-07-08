// src/schemas/turmaSchema.js

const { z } = require('zod');

const turmaSchema = z.object({
  nome: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
});

module.exports = { turmaSchema };
