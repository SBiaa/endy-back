// src/schemas/publicacaoSchema.js
// Só garante o formato básico dos campos. A regra de negócio de qual campo
// é obrigatório por tipo (GERAL/TURMA/INDIVIDUAL) continua no controller,
// junto com a checagem de autorização — não duplicar essa lógica aqui.

const { z } = require('zod');

const publicacaoSchema = z.object({
  tipo: z.enum(['GERAL', 'TURMA', 'INDIVIDUAL'], { error: 'deve ser GERAL, TURMA ou INDIVIDUAL' }),
  conteudo: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
  turmaId: z.string().trim().min(1).optional(),
  alunoId: z.string().trim().min(1).optional(),
});

// PUT /publicacoes/:id só edita conteudo (o controller nem lê tipo/turmaId/alunoId do body)
const publicacaoUpdateSchema = z.object({
  conteudo: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
});

module.exports = { publicacaoSchema, publicacaoUpdateSchema };
