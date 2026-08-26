---
status: concluida
modulo: src
owner: Pedro Scarcela
criado-em: 2026-08-25
---

# 0070 — Performance e teste de uso real

**Task ID**: `TASK-0070`

## Objetivo

Confirmar que a interface não ficou perceptivelmente mais lenta após o redesign (SPEC-005 §59),
e, se viável no ambiente disponível, realizar teste de uso real com representantes dos perfis
servidor e coordenador (§60-63), registrando literalmente as observações (§64) e as métricas
opcionais aplicáveis (§65).

## Escopo

Bundle de produção (`npm run build`), telas de maior peso (`Dashboard`, `ScaleForm`,
`AuthenticatedLayout`), e os fluxos já mapeados nas `TASK-0060`/`TASK-0061` como roteiro para
eventual teste com usuário real.

## Metodologia

Performance (§59): comparar o tamanho do bundle de produção (já visível na saída de
`npm run build`) e o tempo de carregamento percebido antes/depois — sem otimização prematura;
só registrar se algo realmente regrediu de forma perceptível.

Teste de uso real (§60-63): **condicional** — a própria SPEC-005 marca este teste como
"se possível" (§60). Se houver pessoas disponíveis representando servidor/coordenador/
administrador neste momento do projeto, aplicar as tarefas de exemplo dos §61-62 sem ensinar o
caminho antes (§63) e registrar literalmente dúvidas, erros, hesitações, tentativas, comentários
e caminhos inesperados (§64), junto às métricas opcionais viáveis (§65: tempo, passos, erros,
abandono, necessidade de ajuda) — sem construir infraestrutura de analytics só para isso.

Se não houver usuários reais disponíveis no momento da execução desta task, registrar
explicitamente essa limitação (não simular um teste de usuário fabricando respostas) — os
fluxos já validados nas `TASK-0060`/`TASK-0061` pelo próprio agente permanecem como a evidência
de UX disponível para esta etapa.

## Dependências

- `TASK-0056` — Etapa 4 concluída.
- `TASK-0060`, `TASK-0061` — fluxos principais já mapeados, roteiro reaproveitável para o teste
  de uso real, se ele ocorrer.

## Critérios de conclusão

- [~] Tamanho de bundle e tempo de carregamento medidos com dado real; comparação numérica exata
      com o "antes" não foi possível (ver Notas de progresso para o motivo e o proxy usado).
- [x] Teste de uso real realizado (se viável) ou sua inviabilidade registrada explicitamente,
      com o motivo.
- [x] Caso realizado, observações literais registradas e convertidas em problemas de UX (§64).
- [x] Problemas encontrados classificados P0-P3 (§53), sem correção aplicada nesta task.

## Riscos

- O teste de uso real depende de disponibilidade externa (pessoas reais) fora do controle do
  agente — tratado como condicional desde o início, não como bloqueio da etapa.

## Referências

- [`docs/specs/SPEC-005.md`](../specs/SPEC-005.md) — §59-65, §53.

## Notas de progresso

- 2026-08-25 — Task criada a partir da decomposição da SPEC-005.
- 2026-08-25 — Task reivindicada e executada.

  **§59 Performance.** Build de produção limpo gerado (`npm run build`): **694 KB** de saída
  total (595 KB JS + 58 KB CSS, 66 chunks — code-splitting real por rota, não um bundle
  monolítico), maior chunk único 167,73 KB (63,24 KB gzip). Servido estaticamente via
  `vite preview` (não o servidor de dev, que tem overhead de HMR e não representa o que um
  usuário real recebe) e medido com Playwright + CDP `Network.emulateNetworkConditions`
  simulando 4G (40ms latência, ~4 Mbps download): `/login` carrega em **~2,77 s a frio** e
  **~0,28 s com cache do navegador já aquecido** (métricas reais de `performance.timing`, não
  estimativa). Números saudáveis pra uma SPA deste tamanho — sem sinal de regressão perceptível.

  **Comparação numérica exata com o "antes" do redesign não foi possível nesta sessão**: o
  histórico do `dist/` no Git só tem 1 commit (o commit inicial do projeto, `78b9b0e`), sem uma
  série de builds de produção ao longo do tempo pra comparar; reconstruir o bundle de um commit
  anterior à Etapa 4 exigiria `git checkout` de um commit antigo, o que não é seguro fazer agora
  com as alterações não commitadas das `TASK-0068`/`0069` ainda na árvore de trabalho — optei por
  não arriscar uma operação destrutiva-adjacente só pra obter um número histórico, consistente
  com a disciplina de segurança já seguida a sessão inteira. Registrado como limitação, não como
  "regressão não encontrada" — a evidência indireta mais forte de que não houve inchaço é a já
  registrada em várias tasks anteriores: **nenhuma dependência nova de peso foi adicionada
  durante toda a Etapa 4** (só `@heroicons/vue`, uma biblioteca de ícones SVG leve; nenhum
  componente de UI de terceiros, nenhuma biblioteca de gráficos, nenhum framework CSS adicional).

  **§60-65 Teste de uso real.** **Não realizado** — não há pessoas disponíveis representando
  servidor/coordenador/administrador para um teste de usabilidade real neste momento da sessão
  (execução autônoma, sem acesso a testadores humanos). Registrado explicitamente como
  inviabilidade, não simulado ou inventado, conforme a própria SPEC-005 §60 antecipa ("se
  possível"). A evidência de UX disponível para esta etapa continua sendo a validação de fluxo
  real já feita pelo próprio agente nas `TASK-0060` (fluxos do servidor, incluindo o achado P1 do
  Dashboard) e `TASK-0061` (fluxos do coordenador) — mais próxima de um "teste de tarefa
  heurístico" (§11) do que de um teste de uso real com terceiros, mas é a evidência que existe.

  Nenhuma correção aplicada — `git status` confirmado limpo em `src/`/`api/` (só o build/preview
  temporários, revertidos). Task marcada `concluida`. Próximo passo: `TASK-0071` (consolidação —
  última tarefa de validação antes da geração das tasks de correção).
