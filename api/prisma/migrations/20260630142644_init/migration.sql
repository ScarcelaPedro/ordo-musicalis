-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'coordenador', 'musico');

-- CreateEnum
CREATE TYPE "ScaleStatus" AS ENUM ('rascunho', 'confirmada');

-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('data_especifica', 'recorrente_semanal');

-- CreateEnum
CREATE TYPE "Period" AS ENUM ('manha', 'tarde', 'noite');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'musico',
    "password_reset_token" TEXT,
    "password_reset_at" TIMESTAMP(3),
    "remember_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "musicians" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "musicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instruments" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_musician" (
    "id" SERIAL NOT NULL,
    "instrument_id" INTEGER NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instrument_musician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "musician_team" (
    "id" SERIAL NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "musician_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scales" (
    "id" SERIAL NOT NULL,
    "data_celebracao" DATE NOT NULL,
    "horario" TEXT NOT NULL,
    "celebracao" TEXT NOT NULL,
    "team_id" INTEGER,
    "observacoes" TEXT,
    "status" "ScaleStatus" NOT NULL DEFAULT 'rascunho',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_musician" (
    "id" SERIAL NOT NULL,
    "scale_id" INTEGER NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scale_musician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repertoires" (
    "id" SERIAL NOT NULL,
    "scale_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repertoires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repertoire_items" (
    "id" SERIAL NOT NULL,
    "repertoire_id" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "titulo_musica" TEXT NOT NULL,
    "tom" TEXT,
    "arquivo_pdf_path" TEXT,
    "link_externo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repertoire_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availabilities" (
    "id" SERIAL NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "tipo" "AvailabilityType" NOT NULL,
    "dia_semana" SMALLINT,
    "data" DATE,
    "periodo" "Period" NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "musicians_user_id_key" ON "musicians"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_musician_instrument_id_musician_id_key" ON "instrument_musician"("instrument_id", "musician_id");

-- CreateIndex
CREATE UNIQUE INDEX "musician_team_musician_id_team_id_key" ON "musician_team"("musician_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "scale_musician_scale_id_musician_id_key" ON "scale_musician"("scale_id", "musician_id");

-- CreateIndex
CREATE UNIQUE INDEX "repertoires_scale_id_key" ON "repertoires"("scale_id");

-- AddForeignKey
ALTER TABLE "musicians" ADD CONSTRAINT "musicians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_musician" ADD CONSTRAINT "instrument_musician_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_musician" ADD CONSTRAINT "instrument_musician_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musician_team" ADD CONSTRAINT "musician_team_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musician_team" ADD CONSTRAINT "musician_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scales" ADD CONSTRAINT "scales_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_musician" ADD CONSTRAINT "scale_musician_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_musician" ADD CONSTRAINT "scale_musician_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_musician" ADD CONSTRAINT "scale_musician_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repertoires" ADD CONSTRAINT "repertoires_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repertoire_items" ADD CONSTRAINT "repertoire_items_repertoire_id_fkey" FOREIGN KEY ("repertoire_id") REFERENCES "repertoires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;
