// src/schemas/cardapioSchema.js

const { z } = require('zod');

const cardapioSchema = z.object({
  cafe: z.string().trim().optional(),
  almoco: z.string().trim().optional(),
  lanche: z.string().trim().optional(),
});

module.exports = { cardapioSchema };
