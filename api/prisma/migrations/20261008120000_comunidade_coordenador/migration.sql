-- Coordenadores de comunidade (TASK-0129, ADR-0009): vínculo N:N servidor ↔ comunidade. Quem está
-- aqui pode, só nessa comunidade, editar os servidores das celebrações e decidir substituições.

-- CreateTable
CREATE TABLE "comunidade_coordenador" (
    "id" SERIAL NOT NULL,
    "comunidade_id" INTEGER NOT NULL,
    "servidor_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunidade_coordenador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comunidade_coordenador_comunidade_id_servidor_id_key" ON "comunidade_coordenador"("comunidade_id", "servidor_id");

-- AddForeignKey
ALTER TABLE "comunidade_coordenador" ADD CONSTRAINT "comunidade_coordenador_comunidade_id_fkey" FOREIGN KEY ("comunidade_id") REFERENCES "comunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunidade_coordenador" ADD CONSTRAINT "comunidade_coordenador_servidor_id_fkey" FOREIGN KEY ("servidor_id") REFERENCES "servidores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

