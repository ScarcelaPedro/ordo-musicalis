-- Celebrante deixa de ser um Servidor (não faz sentido um padre ter instrumentos,
-- nível ou ministério) e vira uma entidade própria, simples.

CREATE TABLE "celebrantes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "celebrantes_pkey" PRIMARY KEY ("id")
);

-- Migra pra "celebrantes" qualquer servidor que hoje já esteja em uso como celebrante
-- em alguma escala, preservando o vínculo (repointa scales.celebrante_id pro novo id).
-- Não apaga o registro antigo em "servidores" -- inofensivo ficar duplicado, e evita
-- risco de apagar algo referenciado em outro lugar (vínculo de ministério, usuário etc.).
DO $$
DECLARE
  r RECORD;
  new_id INTEGER;
BEGIN
  FOR r IN
    SELECT DISTINCT s.id AS old_servidor_id, s.nome, s.telefone, s.email, s.ativo
    FROM "servidores" s
    JOIN "scales" sc ON sc."celebrante_id" = s."id"
  LOOP
    INSERT INTO "celebrantes" ("nome", "telefone", "email", "ativo")
    VALUES (r.nome, r.telefone, r.email, r.ativo)
    RETURNING "id" INTO new_id;

    UPDATE "scales" SET "celebrante_id" = new_id WHERE "celebrante_id" = r.old_servidor_id;
  END LOOP;
END $$;

ALTER TABLE "scales" DROP CONSTRAINT "scales_celebrante_id_fkey";
ALTER TABLE "scales" ADD CONSTRAINT "scales_celebrante_id_fkey" FOREIGN KEY ("celebrante_id") REFERENCES "celebrantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
