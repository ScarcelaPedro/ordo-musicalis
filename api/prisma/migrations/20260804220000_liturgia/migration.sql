-- Liturgia diária, sincronizada automaticamente a partir de uma API externa. Chaveada por data,
-- não por escala -- a mesma liturgia vale pra qualquer celebração no mesmo dia, em qualquer
-- comunidade. editado_manualmente marca dias corrigidos à mão, que a sincronização nunca
-- sobrescreve.

CREATE TABLE "liturgias" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "liturgia" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "tem_gloria" BOOLEAN NOT NULL DEFAULT false,
    "tem_credo" BOOLEAN NOT NULL DEFAULT false,
    "antifona_entrada" TEXT,
    "coleta" TEXT,
    "primeira_leitura" JSONB,
    "salmo" JSONB,
    "segunda_leitura" JSONB,
    "evangelho" JSONB,
    "oferendas" TEXT,
    "antifona_comunhao" TEXT,
    "oracao_comunhao" TEXT,
    "editado_manualmente" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liturgias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "liturgias_data_key" ON "liturgias"("data");
