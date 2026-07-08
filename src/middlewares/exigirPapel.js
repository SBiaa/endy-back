// src/middlewares/exigirPapel.js
// Uso: exigirPapel('ADMIN') ou exigirPapel('ADMIN', 'PROFESSOR')
// Sempre usado DEPOIS do autenticar (precisa de req.usuario já populado).

function exigirPapel(...papeisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      // segurança extra: se alguém esquecer de colocar `autenticar` antes
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    if (!papeisPermitidos.includes(req.usuario.papel)) {
      return res.status(403).json({ erro: 'Sem permissão para acessar este recurso' });
    }

    next();
  };
}

module.exports = exigirPapel;