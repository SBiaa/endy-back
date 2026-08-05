// src/schemas/presencaSchema.js

const { z } = require('zod');

const STATUS_PRESENCA = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO'];

// motivo só é obrigatório quando status = JUSTIFICADO — daí o superRefine
// em vez de um .optional() simples
function exigirMotivoSeJustificado(valores, ctx) {
  if (valores.status === 'JUSTIFICADO' && !valores.motivo) {
    ctx.addIssue({
      code: 'custom',
      path: ['motivo'],
      message: 'motivo é obrigatório quando status é JUSTIFICADO',
    });
  }
}

const presencaSchema = z
  .object({
    alunoId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
    data: z.coerce.date({ error: 'data inválida' }),
    status: z.enum(STATUS_PRESENCA, { error: 'status deve ser PRESENTE, AUSENTE ou JUSTIFICADO' }),
    motivo: z.string().trim().min(1).optional(),
  })
  .superRefine(exigirMotivoSeJustificado);

// PUT /presencas/:id não permite mudar alunoId nem data (evita colidir
// com @@unique([alunoId, data])) — controller nem lê esses campos do body no update.
const presencaUpdateSchema = z
  .object({
    status: z.enum(STATUS_PRESENCA, { error: 'status deve ser PRESENTE, AUSENTE ou JUSTIFICADO' }),
    motivo: z.string().trim().min(1).optional(),
  })
  .superRefine(exigirMotivoSeJustificado);

const presencaLoteItemSchema = z
  .object({
    alunoId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
    status: z.enum(STATUS_PRESENCA, { error: 'status deve ser PRESENTE, AUSENTE ou JUSTIFICADO' }),
    motivo: z.string().trim().min(1).optional(),
  })
  .superRefine(exigirMotivoSeJustificado);

const presencaLoteSchema = z.object({
  turmaId: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
  data: z.coerce.date({ error: 'data inválida' }),
  registros: z.array(presencaLoteItemSchema).min(1, 'registros não pode ser vazio'),
});

module.exports = { presencaSchema, presencaUpdateSchema, presencaLoteSchema };
