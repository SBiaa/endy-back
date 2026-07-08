-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('RESPONSAVEL', 'PROFESSOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoPublicacao" AS ENUM ('GERAL', 'TURMA', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "HumorDia" AS ENUM ('OTIMO', 'BOM', 'AGITADO', 'CHOROSO', 'ADOECIDO');

-- CreateEnum
CREATE TYPE "QuantidadeRefeicao" AS ENUM ('TUDO', 'METADE', 'POUCO', 'RECUSOU', 'NAO_SE_APLICA');

-- CreateEnum
CREATE TYPE "QualidadeSono" AS ENUM ('DORMIU_BEM', 'DORMIU_POUCO', 'AGITADO', 'NAO_DORMIU');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "alergias" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "turmaId" TEXT NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponsavelAluno" (
    "id" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "parentesco" TEXT,

    CONSTRAINT "ResponsavelAluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publicacao" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPublicacao" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autorId" TEXT NOT NULL,
    "turmaId" TEXT,
    "alunoId" TEXT,

    CONSTRAINT "Publicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroDiario" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "humor" "HumorDia" NOT NULL,
    "cafe" "QuantidadeRefeicao" NOT NULL DEFAULT 'NAO_SE_APLICA',
    "almoco" "QuantidadeRefeicao" NOT NULL DEFAULT 'NAO_SE_APLICA',
    "lanche" "QuantidadeRefeicao" NOT NULL DEFAULT 'NAO_SE_APLICA',
    "sono" "QualidadeSono" NOT NULL,
    "trocasFralda" INTEGER,
    "evacuou" BOOLEAN,
    "atividades" TEXT,
    "materiaisNecessarios" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,

    CONSTRAINT "RegistroDiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfessorTurmas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ResponsavelAluno_responsavelId_alunoId_key" ON "ResponsavelAluno"("responsavelId", "alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroDiario_alunoId_data_key" ON "RegistroDiario"("alunoId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "_ProfessorTurmas_AB_unique" ON "_ProfessorTurmas"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfessorTurmas_B_index" ON "_ProfessorTurmas"("B");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsavelAluno" ADD CONSTRAINT "ResponsavelAluno_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsavelAluno" ADD CONSTRAINT "ResponsavelAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacao" ADD CONSTRAINT "Publicacao_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacao" ADD CONSTRAINT "Publicacao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacao" ADD CONSTRAINT "Publicacao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDiario" ADD CONSTRAINT "RegistroDiario_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDiario" ADD CONSTRAINT "RegistroDiario_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessorTurmas" ADD CONSTRAINT "_ProfessorTurmas_A_fkey" FOREIGN KEY ("A") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessorTurmas" ADD CONSTRAINT "_ProfessorTurmas_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
