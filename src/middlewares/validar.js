// src/middlewares/validar.js
// Uso: router.post('/', validar(algumSchema), controller)
// Valida req.body contra um schema zod. Se falhar, 400 com mensagem legível
// ("campo: mensagem"). Se passar, substitui req.body pelo resultado parseado
// (já com os tipos corretos, ex: datas convertidas de string pra Date).

function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const primeiroErro = resultado.error.issues[0];
      const campo = primeiroErro.path.join('.');
      const mensagem = campo ? `${campo}: ${primeiroErro.message}` : primeiroErro.message;

      return res.status(400).json({ erro: mensagem });
    }

    req.body = resultado.data;
    next();
  };
}

module.exports = validar;
