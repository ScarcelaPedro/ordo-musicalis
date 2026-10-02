-- Recorrências passam a valer para qualquer função e qualquer comunidade (TASK-0117, ADR-0006).
-- Até aqui a recorrência não tinha comunidade (a geração forçava a Matriz) e o vínculo fixo só
-- guardava servidor + instrumento, então a equipe gerada caía em "sem função definida".

ALTER TABLE "scale_templates" ADD COLUMN "comunidade_id" INTEGER;
ALTER TABLE "scale_templates" ADD CONSTRAINT "scale_templates_comunidade_id_fkey" FOREIGN KEY ("comunidade_id") REFERENCES "comunidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "vinculos_fixos" ADD COLUMN "categoria_id" INTEGER;
ALTER TABLE "vinculos_fixos" ADD COLUMN "team_id" INTEGER;
ALTER TABLE "vinculos_fixos" ADD COLUMN "funcao_liturgica" "FuncaoLiturgica";
ALTER TABLE "vinculos_fixos" ADD CONSTRAINT "vinculos_fixos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_funcao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vinculos_fixos" ADD CONSTRAINT "vinculos_fixos_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill 1: recorrências antigas ficam na comunidade em que já eram geradas (Matriz), ou na
-- primeira comunidade cadastrada se não houver uma chamada "Matriz".
UPDATE "scale_templates"
SET "comunidade_id" = COALESCE(
  (SELECT "id" FROM "comunidades" WHERE "nome" = 'Matriz' ORDER BY "id" LIMIT 1),
  (SELECT "id" FROM "comunidades" ORDER BY "id" LIMIT 1)
)
WHERE "comunidade_id" IS NULL;

-- Backfill 2: o vínculo herda o ministério da recorrência (era o que a geração já gravava na
-- escalação) e a categoria desse ministério.
UPDATE "vinculos_fixos" vf
SET "team_id" = st."team_id"
FROM "scale_templates" st
WHERE vf."scale_template_id" = st."id" AND vf."team_id" IS NULL AND st."team_id" IS NOT NULL;

UPDATE "vinculos_fixos" vf
SET "categoria_id" = t."categoria_id"
FROM "teams" t
WHERE vf."team_id" = t."id" AND vf."categoria_id" IS NULL;

-- Backfill 3: sem ministério, mas com instrumento, só pode ser Música.
UPDATE "vinculos_fixos"
SET "categoria_id" = (SELECT "id" FROM "categorias_funcao" WHERE "nome" = 'Música' ORDER BY "id" LIMIT 1)
WHERE "categoria_id" IS NULL AND "instrument_id" IS NOT NULL;
