---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-09-25
---

# 0105 — Linguagem multiministério em toda a UI

**Task ID**: `TASK-0105`

**Prioridade**: P2

## Objetivo

Garantir que a interface não assuma que o sistema é exclusivamente musical (SPEC-003.1 §1, §13,
§14, §32): "um sistema paroquial de gestão de escalas, capaz de atender diferentes ministérios".

## Escopo (discovery + correção de apresentação)

Varredura de `src/` por textos, ícones e composições voltados só a música **em contexto
genérico de escala/servidor**, por exemplo:

- componentes compartilhados de escala (`ScaleCard`, `ScaleMember`, `CelebrationHeader`,
  `MyScales.vue`) que mostram instrumento sem mostrar função/categoria;
- rótulos, empty states e textos de ajuda que falem em "músicos" onde o correto é "servidores";
- ícones musicais usados como símbolo genérico do sistema (layouts, dashboard, telas de auth).

**Fora de escopo** (§30 — não alterar sem necessidade):

- telas legitimamente musicais (Repertório, instrumentos) — música é um dos ministérios;
- nome do produto "Ordo Musicalis";
- valor de papel `musico` em `auth.ts`/router e checagens `categoria.nome === 'Música'`
  (`ScaleForm.vue`, `ServidorForm.vue`, `servidores/Show.vue`) — são regra de negócio/permissão.
  Se o **rótulo exibido** do papel `musico` aparecer na UI, pode ser trocado para "Servidor"
  sem mudar o valor; se não for só rótulo, registrar como achado e não alterar.

## Comportamento esperado

- Onde uma escalação é exibida: função/categoria real primeiro, instrumento como complemento.
- Textos genéricos neutros quanto a ministério.
- Lista de achados (arquivo:linha → ação tomada ou motivo de não alterar) registrada nas notas.

## Dependências

- Nenhuma (coordenar com `TASK-0104` se estiver em andamento — ela já corrige o Dashboard do
  servidor; não duplicar).

## Critérios de conclusão

- [x] Varredura registrada nas notas de progresso com decisão por achado.
- [x] Componentes compartilhados de escala exibem função/categoria para qualquer ministério.
- [x] Nenhuma alteração de regra de negócio, permissão, entidade ou API.
- [x] Verificado com escalas contendo Leitor, Acólito, Ministro da Eucaristia e Músico.
- [x] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §1, §13, §14, §30, §32.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
- 2026-09-25 — Task reivindicada e executada. Commit: `6c6e829`.

  **Varredura** (`grep` por música/instrumento/♪/"músico" em `src/`), com a decisão por achado:

  | Achado | Ação |
  |---|---|
  | `scales/MyScales.vue` `detalheMinha`: só instrumento + função litúrgica. Leitor/Ministro não via função nenhuma | **Corrigido**: ministério primeiro (`assignmentRoleLabel` + `resolveAssignment` do util da `TASK-0104`, nomes via `GET /categorias`/`GET /teams`), depois função/instrumento; o team legado da escala continua ao final |
  | `substitutions/Index.vue`: "Titular: Nome · {instrumento}" | **Corrigido**: "Titular: Nome · {ministério · função/instrumento}" |
  | `FUNCAO_LITURGICA_LABELS` duplicado em `MyScales.vue` e `scales/Show.vue` | **Deduplicado**: ambos usam `src/utils/scaleRole.ts` |
  | `MyScales.vue` separava próximas/histórico por `toISOString()` (UTC) | **Corrigido** junto (`localDateKey`), mesmo bug da `TASK-0102`/`0104` |
  | `pages/public/Calendar.vue`: "Nome · {instrumento}" | **Não alterado**: a rota pública `api/_routes/public.ts` não seleciona `categoriaId`, e `/categorias` exige login. Mostrar o ministério exigiria mudar a API; fica como achado para decisão futura |
  | `scales/Show.vue` membro: instrumento/função | **Sem mudança**: os membros já aparecem agrupados por categoria (o ministério é o cabeçalho do grupo) |
  | `♪` no Dashboard | Já removido na `TASK-0104` |
  | Checagens `categoria.nome === 'Música'` (`ScaleForm`, `ServidorForm`, `servidores/Show`) | **Fora de escopo** (regra de negócio: instrumento só para Música) |
  | Papel `musico` (`auth.ts`/router) | **Não alterado**: valor de permissão; confirmado por grep que **não é exibido como texto** em nenhuma tela |
  | Repertório ("Música adicionada" etc.), instrumentos, "Ordo Musicalis" | **Fora de escopo**: telas legitimamente musicais e nome do produto |
  | Textos genéricos "músicos" em telas de escala/servidor | Nenhum encontrado |

  **Verificação** (seed temporário + 2 substituições criadas no banco de teste): Minha Escala da
  Leitora mostra "Leitores" nas 3 escalas. Substituições mostra "Bruno Lima · Acólitos e
  Ancilas" e "Davi Rocha · Música · Violão". Com isso ficam cobertos Leitor, Acólito e Música na
  UI real; Ministro da Comunhão está coberto pelo teste do util. `npm run build` e `npm test`
  passam; `dist/` revertido. Nenhuma alteração de regra de negócio, permissão, entidade ou API.
