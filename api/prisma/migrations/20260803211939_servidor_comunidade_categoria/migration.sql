-- Rename: Musician (e tudo relacionado) -> Servidor. Usa RENAME em vez de dropar-e-recriar
-- pra preservar os dados existentes. Nomes de constraint/index antigos (ex: "musicians_pkey")
-- continuam com o texto antigo -- é só cosmético, não afeta nada.

ALTER TYPE "MusicianLevel" RENAME TO "NivelServidor";

ALTER TABLE "musicians" RENAME TO "servidores";

ALTER TABLE "musician_team" RENAME TO "servidor_ministerio";
ALTER TABLE "servidor_ministerio" RENAME COLUMN "musician_id" TO "servidor_id";

ALTER TABLE "instrument_musician" RENAME TO "instrument_servidor";
ALTER TABLE "instrument_servidor" RENAME COLUMN "musician_id" TO "servidor_id";

ALTER TABLE "scale_musician" RENAME TO "scale_servidor";
ALTER TABLE "scale_servidor" RENAME COLUMN "musician_id" TO "servidor_id";

ALTER TABLE "vinculos_fixos" RENAME COLUMN "musician_id" TO "servidor_id";
ALTER TABLE "availabilities" RENAME COLUMN "musician_id" TO "servidor_id";
ALTER TABLE "availability_window_responses" RENAME COLUMN "musician_id" TO "servidor_id";
ALTER TABLE "substituicoes" RENAME COLUMN "scale_musician_id" TO "scale_servidor_id";

-- CreateTable: Comunidade (nova) + seed da "Matriz"

CREATE TABLE "comunidades" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunidades_pkey" PRIMARY KEY ("id")
);

INSERT INTO "comunidades" ("nome") VALUES ('Matriz');

-- CreateTable: CategoriaFuncao (nova, cadastrável) + seed das categorias iniciais

CREATE TABLE "categorias_funcao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_funcao_pkey" PRIMARY KEY ("id")
);

INSERT INTO "categorias_funcao" ("nome", "ordem") VALUES
  ('Música', 1),
  ('Ministros da Comunhão', 2),
  ('Acólitos e Coroinhas', 3),
  ('Leitores', 4),
  ('Comentaristas', 5);

-- AlterTable: teams.categoria_id (obrigatório, backfill = "Música")

ALTER TABLE "teams" ADD COLUMN "categoria_id" INTEGER;

UPDATE "teams" SET "categoria_id" = (SELECT "id" FROM "categorias_funcao" WHERE "nome" = 'Música');

ALTER TABLE "teams" ALTER COLUMN "categoria_id" SET NOT NULL;
ALTER TABLE "teams" ADD CONSTRAINT "teams_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_funcao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: scales.comunidade_id (obrigatório, backfill = "Matriz")

ALTER TABLE "scales" ADD COLUMN "comunidade_id" INTEGER;

UPDATE "scales" SET "comunidade_id" = (SELECT "id" FROM "comunidades" WHERE "nome" = 'Matriz');

ALTER TABLE "scales" ALTER COLUMN "comunidade_id" SET NOT NULL;
ALTER TABLE "scales" ADD CONSTRAINT "scales_comunidade_id_fkey" FOREIGN KEY ("comunidade_id") REFERENCES "comunidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: scales.celebrante_id (opcional, sem backfill)

ALTER TABLE "scales" ADD COLUMN "celebrante_id" INTEGER;
ALTER TABLE "scales" ADD CONSTRAINT "scales_celebrante_id_fkey" FOREIGN KEY ("celebrante_id") REFERENCES "servidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: scale_servidor.team_id (opcional -- ministério da pessoa nessa celebração)

ALTER TABLE "scale_servidor" ADD COLUMN "team_id" INTEGER;
ALTER TABLE "scale_servidor" ADD CONSTRAINT "scale_servidor_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
