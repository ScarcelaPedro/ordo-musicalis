-- CreateTable
CREATE TABLE "vinculos_fixos" (
    "id" SERIAL NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER,
    "scale_template_id" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vinculos_fixos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_windows" (
    "id" SERIAL NOT NULL,
    "mes" TEXT NOT NULL,
    "prazo" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_window_responses" (
    "id" SERIAL NOT NULL,
    "window_id" INTEGER NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "responded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_window_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vinculos_fixos_musician_id_scale_template_id_key" ON "vinculos_fixos"("musician_id", "scale_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "availability_windows_mes_key" ON "availability_windows"("mes");

-- CreateIndex
CREATE UNIQUE INDEX "availability_window_responses_window_id_musician_id_key" ON "availability_window_responses"("window_id", "musician_id");

-- AddForeignKey
ALTER TABLE "vinculos_fixos" ADD CONSTRAINT "vinculos_fixos_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculos_fixos" ADD CONSTRAINT "vinculos_fixos_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculos_fixos" ADD CONSTRAINT "vinculos_fixos_scale_template_id_fkey" FOREIGN KEY ("scale_template_id") REFERENCES "scale_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_window_responses" ADD CONSTRAINT "availability_window_responses_window_id_fkey" FOREIGN KEY ("window_id") REFERENCES "availability_windows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_window_responses" ADD CONSTRAINT "availability_window_responses_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;
