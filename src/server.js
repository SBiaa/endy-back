// src/server.js
require('dotenv').config();

const ENV_OBRIGATORIAS = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
const faltando = ENV_OBRIGATORIAS.filter((chave) => !process.env[chave]);

if (faltando.length > 0) {
  console.error(`Variáveis de ambiente obrigatórias não definidas: ${faltando.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const prisma = require('./lib/prisma');
const authRoutes = require('./routes/authRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const responsavelAlunoRoutes = require('./routes/responsavelAlunoRoutes');
const professorTurmaRoutes = require('./routes/professorTurmaRoutes');
const publicacaoRoutes = require('./routes/publicacaoRoutes');
const registroDiarioRoutes = require('./routes/registroDiarioRoutes');
const presencaRoutes = require('./routes/presencaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json()); // pra ler JSON no body das requisições

// rota de teste "tá vivo"
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API da Agenda Digital no ar 🚀' });
});

// rota de teste de conexão com o banco
// (é só pra confirmar que o Prisma tá falando com o Neon — pode apagar depois)
app.use('/auth', authRoutes);
app.use('/turmas', turmaRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/alunos', alunoRoutes);
app.use('/responsavel-aluno', responsavelAlunoRoutes);
app.use('/professor-turma', professorTurmaRoutes);
app.use('/publicacoes', publicacaoRoutes);
app.use('/registros-diario', registroDiarioRoutes);
app.use('/presencas', presencaRoutes);
app.use('/dashboard', dashboardRoutes);
app.get('/health/db', async (req, res) => {
  try {
    // conta quantos usuários existem (deve ser 0 por enquanto, banco tá vazio)
    const totalUsuarios = await prisma.usuario.count();
    res.json({ status: 'ok', totalUsuarios });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ status: 'erro', mensagem: 'Falha ao conectar no banco' });
  }
});

app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORTA = process.env.PORT || 3333;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});