-- Funções litúrgicas dos Acólitos e Ancilas numa celebração (opcional): Cerimoniário 1/2,
-- Librífero, Cruciferário, Ceroferário, Turiferário, Naveteiro. Qualquer acólito/ancila está
-- apto pra qualquer uma -- diferente de instrumento, aqui não depende de aptidão cadastrada.

CREATE TYPE "FuncaoLiturgica" AS ENUM ('cerimoniario_1', 'cerimoniario_2', 'librifero', 'cruciferario', 'ceroferario', 'turiferario', 'naveteiro');

ALTER TABLE "scale_servidor" ADD COLUMN "funcao_liturgica" "FuncaoLiturgica";
