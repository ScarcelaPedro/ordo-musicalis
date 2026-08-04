-- ScaleServidor ganha categoria_id direto, desacoplado do team_id. Até aqui a categoria de
-- uma escalação só existia indiretamente via team->categoria, o que exigia um Ministério
-- cadastrado pra qualquer função aparecer agrupada na escala -- mas só Música tinha
-- Ministério de verdade atribuído no cadastro de servidor. Agora a categoria é guardada
-- direto na escalação; o Ministério (team_id) continua existindo como vínculo opcional
-- adicional (útil sobretudo pra Música, com seus grupos como "Coral" e "Grupo Jovem").

ALTER TABLE "scale_servidor" ADD COLUMN "categoria_id" INTEGER;
ALTER TABLE "scale_servidor" ADD CONSTRAINT "scale_servidor_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_funcao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: quem já tinha team_id preenchido ganha a categoria daquele team, pra não perder
-- o agrupamento das escalações que já existiam.
UPDATE "scale_servidor" ss
SET "categoria_id" = t."categoria_id"
FROM "teams" t
WHERE ss."team_id" = t."id" AND ss."categoria_id" IS NULL;
