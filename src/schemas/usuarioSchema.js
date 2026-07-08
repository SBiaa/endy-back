// src/schemas/usuarioSchema.js
// papel nunca aceita ADMIN por aqui — usuarioController só gerencia PROFESSOR/RESPONSAVEL.

const { z } = require('zod');

const usuarioSchema = z.object({
  nome: z.string({ error: 'obrigatório' }).trim().min(2, 'deve ter pelo menos 2 caracteres'),
  email: z.string({ error: 'obrigatório' }).trim().email('email inválido'),
  papel: z.enum(['PROFESSOR', 'RESPONSAVEL'], { error: 'deve ser PROFESSOR ou RESPONSAVEL' }),
});

// senha é exclusivo do update: no criar a senha é sempre gerada automaticamente
// pelo controller (nunca vem do front); no PUT o admin ainda pode resetar manualmente.
const usuarioUpdateSchema = usuarioSchema.partial().extend({
  senha: z.string().min(6, 'deve ter pelo menos 6 caracteres').optional(),
});

module.exports = { usuarioSchema, usuarioUpdateSchema };
