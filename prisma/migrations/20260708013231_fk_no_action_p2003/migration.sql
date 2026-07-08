-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "Publicacao" DROP CONSTRAINT "Publicacao_autorId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroDiario" DROP CONSTRAINT "RegistroDiario_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroDiario" DROP CONSTRAINT "RegistroDiario_professorId_fkey";

-- DropForeignKey
ALTER TABLE "ResponsavelAluno" DROP CONSTRAINT "ResponsavelAluno_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "ResponsavelAluno" DROP CONSTRAINT "ResponsavelAluno_responsavelId_fkey";

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsavelAluno" ADD CONSTRAINT "ResponsavelAluno_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsavelAluno" ADD CONSTRAINT "ResponsavelAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacao" ADD CONSTRAINT "Publicacao_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDiario" ADD CONSTRAINT "RegistroDiario_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDiario" ADD CONSTRAINT "RegistroDiario_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
