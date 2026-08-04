-- Função(ões) do servidor: um servidor pode ser Músico e também Acólito, por exemplo.
-- Instrumentos e Ministério só fazem sentido pra quem tem a função "Música" -- essa tabela
-- é o que permite o formulário decidir se mostra essas seções ou não.

CREATE TABLE "servidor_categoria" (
    "id" SERIAL NOT NULL,
    "servidor_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servidor_categoria_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "servidor_categoria_servidor_id_categoria_id_key" ON "servidor_categoria"("servidor_id", "categoria_id");

ALTER TABLE "servidor_categoria" ADD CONSTRAINT "servidor_categoria_servidor_id_fkey" FOREIGN KEY ("servidor_id") REFERENCES "servidores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "servidor_categoria" ADD CONSTRAINT "servidor_categoria_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_funcao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: infere a função de cada servidor já cadastrado a partir do que já existe --
-- ministério (categoria do time que já integra) e/ou instrumento (assume "Música").
-- Sem isso, todo servidor existente apareceria sem nenhuma função marcada, escondendo
-- os instrumentos/ministérios que já tinha (o dado continua no banco, só ficaria
-- escondido atrás do checkbox desmarcado).

INSERT INTO "servidor_categoria" ("servidor_id", "categoria_id")
SELECT DISTINCT sm."servidor_id", t."categoria_id"
FROM "servidor_ministerio" sm
JOIN "teams" t ON t."id" = sm."team_id"
ON CONFLICT ("servidor_id", "categoria_id") DO NOTHING;

INSERT INTO "servidor_categoria" ("servidor_id", "categoria_id")
SELECT DISTINCT ins."servidor_id", (SELECT "id" FROM "categorias_funcao" WHERE "nome" = 'Música' LIMIT 1)
FROM "instrument_servidor" ins
WHERE (SELECT "id" FROM "categorias_funcao" WHERE "nome" = 'Música' LIMIT 1) IS NOT NULL
ON CONFLICT ("servidor_id", "categoria_id") DO NOTHING;
