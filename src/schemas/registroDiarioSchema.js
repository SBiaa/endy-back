// src/schemas/registroDiarioSchema.js

const { z } = require('zod');

const HUMOR = ['OTIMO', 'BOM', 'AGITADO', 'CHOROSO', 'ADOECIDO'];
const QUANTIDADE_REFEICAO = ['TUDO', 'METADE', 'POUCO', 'RECUSOU', 'NAO_SE_APLICA'];
const QUALIDADE_SONO = ['DORMIU_BEM', 'DORMIU_POUCO', 'AGITADO', 'NAO_DORMIU'];

const registroDiarioSchema = z.object({
  alunoId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
  data: z.coerce.date({ error: 'data inválida' }),
  humor: z.enum(HUMOR, { error: 'valor de humor inválido' }),
  // cafe/almoco/lanche são opcionais: schema.prisma tem @default(NAO_SE_APLICA) pra eles
  cafe: z.enum(QUANTIDADE_REFEICAO, { error: 'valor de refeição inválido' }).optional(),
  almoco: z.enum(QUANTIDADE_REFEICAO, { error: 'valor de refeição inválido' }).optional(),
  lanche: z.enum(QUANTIDADE_REFEICAO, { error: 'valor de refeição inválido' }).optional(),
  sono: z.enum(QUALIDADE_SONO, { error: 'valor de sono inválido' }),
  trocasFralda: z.coerce.number().int().optional(),
  evacuou: z.boolean().optional(),
  atividades: z.string().trim().optional(),
  materiaisNecessarios: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

// PUT /registros-diario/:id não permite mudar alunoId nem data (evita colidir
// com @@unique([alunoId, data])) — controller nem lê esses campos do body no update.
const registroDiarioUpdateSchema = registroDiarioSchema.omit({ alunoId: true, data: true }).partial();

module.exports = { registroDiarioSchema, registroDiarioUpdateSchema };
