# 0007 — Tipo de celebração (Missa × Celebração da Palavra) derivado do título do celebrante

- **Data**: 2026-10-05
- **Status**: aceita
- **Validade**: permanente
- **ADR ID**: `ADR-0007`
- **Task relacionada**: `TASK-0123`

## Contexto

O relatório de missas (`TASK-0123`) precisa separar Missas de Celebrações da Palavra. O modelo
`Scale` não tem um campo de tipo: `celebracao` é texto livre (ex. "Santa Missa", "Missa do
Domingo") e `Celebrante` só tem `nome`. Pela regra informada pelo usuário, padres (Pe.) só celebram
missas e diáconos (Diác.) só celebram Celebrações da Palavra. Os nomes dos celebrantes já são
cadastrados com o título na frente.

## Decisão

O tipo é derivado em `api/_lib/massReport.ts`, sem mudar o banco:

1. Pelo título no começo do nome do celebrante (sem acento e sem diferenciar maiúsculas):
   `Pe`, `Padre`, `Mons`, `Monsenhor`, `Dom` → Missa; `Diac`, `Diácono` → Celebração da Palavra.
2. Sem celebrante, ou com título não reconhecido: pelo texto de `celebracao` (`palavra` →
   Celebração da Palavra; `missa` → Missa).
3. Fora disso, a celebração entra como "outra" (aparece no relatório por comunidade, não por
   celebrante).

## Alternativas consideradas

- Novo campo enum `tipo` em `Scale` — mais explícito, mas exige migration (aplicada à mão no
  Supabase), mudança no formulário de escala e nas recorrências, e o preenchimento das escalas que
  já existem. Fica como evolução se a inferência se mostrar insuficiente.
- Campo `tipo`/`ordem` em `Celebrante` — mesmo custo de migration e cadastro; o título no nome já
  carrega a informação.
- Só pelo texto de `celebracao` — frágil, porque o nome é livre e muitas escalas dizem apenas
  "Celebração dominical".

## Consequências

- Um celebrante cadastrado sem título (ex. "João Silva") não aparece no relatório por celebrante,
  e a celebração dele depende do texto de `celebracao`. Basta corrigir o nome no cadastro.
- Se um dia for criado um campo explícito de tipo, ele deve ter precedência sobre esta inferência.
