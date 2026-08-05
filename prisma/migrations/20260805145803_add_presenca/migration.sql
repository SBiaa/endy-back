-- CreateEnum
CREATE TYPE "StatusPresenca" AS ENUM ('PRESENTE', 'AUSENTE', 'JUSTIFICADO');

-- CreateTable
CREATE TABLE "Presenca" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "status" "StatusPresenca" NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Presenca_alunoId_data_key" ON "Presenca"("alunoId", "data");

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
