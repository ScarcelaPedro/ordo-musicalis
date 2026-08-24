---
status: concluida
modulo: docs
owner: Pedro Scarcela
criado-em: 2026-08-21
---

# 0011 — Wireframe de Minha Escala

**Task ID**: `TASK-0011`

## Objetivo

Desenhar a experiência própria do servidor
([`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) §9) — "onde e quando eu vou servir?" — como
algo distinto de uma leitura de tabela administrativa, aprofundando o que já foi estabelecido na
Etapa 1 (SPEC-001 §9, `TASK-0002`: Minha Escala como experiência própria do servidor, com rota
dedicada `/minha-escala`).

## Dependências

- `TASK-0006` — estrutura real de `scales/MyScales.vue` hoje.
- `TASK-0007` — padrões transversais a aplicar aqui.

## Critérios de conclusão

- [x] Wireframe documentado com os campos do §26, estrutura de card por escala: data, horário,
      comunidade, função/instrumento, status de confirmação (§9.1).
- [x] Estados cobertos: vazio (nenhuma escala futura), com pendência de confirmação, já
      confirmado.
- [x] Critérios de aceite "Servidor" do §28 cobertos por este wireframe: Minha Escala possui
      experiência própria; próxima escala é facilmente identificável; confirmação de presença é
      clara.

## Estrutura atual (releitura completa de `scales/MyScales.vue`, 146 linhas)

- Dois blocos: "Próximas celebrações" e "Histórico" (ordem já correta — próximas primeiro,
  consistente com a prioridade do §5.1/§9).
- Cada linha: nome da celebração (link), subtítulo com data/horário/comunidade/ministério,
  badges (vínculo fixo, status), e — só quando pendente (`status: convidado`) — botões
  "Confirmar"/"Não posso ir" inline, com textarea de motivo opcional aparecendo na mesma linha
  ao recusar (sem navegar para outra tela).
- **Já é card-based, não tabela** — confirmado como padrão positivo pela auditoria
  (`TASK-0006`): "mais legível no celular que o calendário em grid"; funciona razoavelmente bem
  sem alterações estruturais.
- **Gap real**: a linha não mostra a função/instrumento da própria pessoa naquela escala (ex.
  "🎵 Violão", como o próprio §9.1 exemplifica) — só comunidade/ministério. O servidor precisa
  abrir os detalhes para saber em que função foi escalado.
- Loading é um texto único "Carregando..." bloqueando a tela inteira (não é skeleton por linha).
- Sem indicação de alteração recente por linha (mesmo gap já registrado na `TASK-0010`).
- Confirmar/recusar já funciona sem navegação de página — auditoria classifica esse fluxo como
  "já enxuto, não precisa de menos passos, só de reforço visual" (`TASK-0006`) — preservado como
  está, sem redesenhar a interação em si.

## Wireframe: Minha Escala

- **Objetivo**: responder "onde e quando eu vou servir?" sem interpretar uma tela
  administrativa (§9).
- **Usuário**: servidor (`musico`).
- **Informação principal**: próxima celebração + minha função + status de confirmação.
- **Ação principal**: confirmar presença, quando pendente.
- **Ações secundárias**: recusar (com motivo opcional, inline — interação preservada como está);
  ver detalhes completos da escala.
- **Estrutura**: mantém os dois blocos existentes (Próximas / Histórico), com dois acréscimos:
  1. Função/instrumento da pessoa exibido na linha (ex. "🎵 Violão", igual ao mockup do §9.1) —
     **dependente de verificação de dado**: exige que `/scales?mine=true` retorne
     `instrument`/`funcaoLiturgica` no pivot da própria pessoa (mesmo padrão já usado por
     `scales/Show.vue`); se já vem, é só renderizar, se não, pequena extensão de API fica como
     pendência de implementação (fora do escopo desta etapa, SPEC-002 §29).
  2. Indicador de alteração recente por linha, mesma decisão e mesma ressalva de dado da
     `TASK-0010`.
  3. Toda a linha permanece clicável levando a `Escala — Detalhes`, com um indicador de
     tappability (ex. chevron `›`) — reaproveitando o mesmo padrão já usado em
     "Minhas próximas escalas" no Dashboard (`Dashboard.vue:278-287`, confirmado na
     `TASK-0006`/`TASK-0008`), em vez de inventar um botão "Ver detalhes" separado como o
     mockup literal do §9.1 sugere — mantém consistência entre as duas telas que mostram a
     mesma informação de formas ligeiramente diferentes hoje.
- **Estados**: loading passa de texto único para skeleton por linha (padrão da `TASK-0007`, §14);
  empty em cada bloco (já existe com mensagem específica — "Nenhuma celebração futura na sua
  escala." / "Nenhuma celebração no histórico.", mantido); confirmation (recusar) mantido como
  interação inline já existente, sem virar modal — auditoria já classifica esse fluxo como bem
  resolvido, não é candidato a redesenho de interação.
- **Mobile**: já funciona bem (cards empilhados) — nenhuma reestruturação responsiva necessária,
  só os acréscimos de conteúdo acima.
- **Desktop**: mesma estrutura — esta tela não tem o problema de largura que o Dashboard tem.
- **Navegação**: vem do menu ("Minha Escala") ou do Dashboard ("Minhas próximas escalas"); leva
  a `Escala — Detalhes` (`TASK-0010`).

## Referências

- [`docs/specs/SPEC-002.md`](../specs/SPEC-002.md) — §9, §25 (Prioridade 4), §26, §28 (Servidor).
- [`docs/specs/SPEC-001.md`](../specs/SPEC-001.md) §9 (Minha Escala como experiência própria).
- `TASK-0006`, `TASK-0007`.

## Notas de progresso

- 2026-08-21 — Task criada a partir da decomposição da SPEC-002.
- 2026-08-21 — Task reivindicada e executada. Releitura completa de `scales/MyScales.vue` (146
  linhas) confirmou que a tela já é card-based e já funciona bem no mobile (achado positivo da
  auditoria preservado, sem reestruturação). Gap real identificado: a linha não mostra a
  função/instrumento da própria pessoa — acrescentado ao wireframe, com ressalva de que depende
  de `/scales?mine=true` já retornar esse dado no pivot (a confirmar na implementação). Optei
  por reaproveitar o padrão de chevron já usado no Dashboard para indicar tappability, em vez de
  adicionar um botão "Ver detalhes" redundante como o mockup literal da SPEC sugere — mantém
  consistência entre as duas telas que mostram a mesma informação. Interação de
  confirmar/recusar preservada exatamente como está, já que a auditoria a classifica como um
  fluxo já bem resolvido. Task marcada `concluida`. Próximo passo: TASK-0012 (listagens
  administrativas) já está elegível.
