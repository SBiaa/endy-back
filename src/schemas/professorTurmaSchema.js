// src/schemas/professorTurmaSchema.js

const { z } = require('zod');

const professorTurmaSchema = z.object({
  professorId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
  turmaId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
});

module.exports = { professorTurmaSchema };
