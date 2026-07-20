-- CreateEnum
CREATE TYPE "MusicianLevel" AS ENUM ('em_formacao', 'apto', 'lider');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('semanal', 'mensal_ordinal');

-- AlterTable
ALTER TABLE "musicians" ADD COLUMN     "nivel" "MusicianLevel" NOT NULL DEFAULT 'apto';

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "responsavel_id" INTEGER;

-- CreateTable
CREATE TABLE "scale_templates" (
    "id" SERIAL NOT NULL,
    "celebracao" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "dia_semana" SMALLINT NOT NULL,
    "tipo_recorrencia" "RecurrenceType" NOT NULL DEFAULT 'semanal',
    "ordinal" SMALLINT,
    "team_id" INTEGER,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scale_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "musicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_templates" ADD CONSTRAINT "scale_templates_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
