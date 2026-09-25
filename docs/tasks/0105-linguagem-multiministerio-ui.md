---
status: em-andamento
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

- [ ] Varredura registrada nas notas de progresso com decisão por achado.
- [ ] Componentes compartilhados de escala exibem função/categoria para qualquer ministério.
- [ ] Nenhuma alteração de regra de negócio, permissão, entidade ou API.
- [ ] Verificado com escalas contendo Leitor, Acólito, Ministro da Eucaristia e Músico.
- [ ] `npm run build` passa sem erros.

## Referências

- [`docs/specs/SPEC-003,1.md`](../specs/SPEC-003,1.md) — §1, §13, §14, §30, §32.

## Notas de progresso

- 2026-09-25 — Task criada a partir da decomposição da SPEC-003.1.
