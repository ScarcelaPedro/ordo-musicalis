-- CreateEnum
CREATE TYPE "OrigemEscalacao" AS ENUM ('fixo', 'provisorio');

-- AlterTable
ALTER TABLE "musician_team" ADD COLUMN     "funcao" TEXT;

-- AlterTable
ALTER TABLE "scale_musician" ADD COLUMN     "lembrete_enviado_em" TIMESTAMP(3),
ADD COLUMN     "origem" "OrigemEscalacao" NOT NULL DEFAULT 'provisorio';

-- AlterTable
ALTER TABLE "scales" ADD COLUMN     "lembrete_dias_antes" INTEGER NOT NULL DEFAULT 3;
