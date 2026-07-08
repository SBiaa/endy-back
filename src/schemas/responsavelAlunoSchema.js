// src/schemas/responsavelAlunoSchema.js

const { z } = require('zod');

const responsavelAlunoSchema = z.object({
  responsavelId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
  alunoId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
  parentesco: z.string().trim().optional(),
});

module.exports = { responsavelAlunoSchema };
