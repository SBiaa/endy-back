// src/schemas/authSchema.js

const { z } = require('zod');

const loginSchema = z.object({
  email: z.string({ error: 'obrigatório' }).trim().email('email inválido'),
  senha: z.string({ error: 'obrigatório' }).min(1, 'obrigatório'),
});

module.exports = { loginSchema };
