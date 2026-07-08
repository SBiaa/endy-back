// src/schemas/alunoSchema.js

const { z } = require('zod');

const alunoSchema = z.object({
  nome: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
  dataNascimento: z.coerce.date({ error: 'data inválida' }),
  turmaId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
  alergias: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

// PUT é update parcial de verdade: qualquer campo omitido fica intocado no controller
const alunoUpdateSchema = alunoSchema.partial();

module.exports = { alunoSchema, alunoUpdateSchema };
