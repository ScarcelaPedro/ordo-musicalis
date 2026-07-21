-- CreateEnum
CREATE TYPE "StatusEscalacao" AS ENUM ('convidado', 'confirmado', 'recusado', 'substituido');

-- CreateEnum
CREATE TYPE "SubstituicaoStatus" AS ENUM ('pendente', 'aprovada', 'rejeitada');

-- AlterTable: add the new column first (nullable), backfill from the old
-- boolean, then drop the boolean. Doing it in three steps instead of a
-- straight DROP+ADD (which is what a naive diff would generate) preserves
-- which musicians had already confirmed their presence.
ALTER TABLE "scale_musician" ADD COLUMN "status" "StatusEscalacao";

UPDATE "scale_musician"
SET "status" = CASE WHEN "confirmado" THEN 'confirmado' ELSE 'convidado' END::"StatusEscalacao";

ALTER TABLE "scale_musician" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "scale_musician" ALTER COLUMN "status" SET DEFAULT 'convidado';
ALTER TABLE "scale_musician" DROP COLUMN "confirmado";

-- CreateTable
CREATE TABLE "substituicoes" (
    "id" SERIAL NOT NULL,
    "scale_musician_id" INTEGER NOT NULL,
    "substituto_id" INTEGER,
    "motivo" TEXT,
    "status" "SubstituicaoStatus" NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "substituicoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "substituicoes" ADD CONSTRAINT "substituicoes_scale_musician_id_fkey" FOREIGN KEY ("scale_musician_id") REFERENCES "scale_musician"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substituicoes" ADD CONSTRAINT "substituicoes_substituto_id_fkey" FOREIGN KEY ("substituto_id") REFERENCES "musicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
