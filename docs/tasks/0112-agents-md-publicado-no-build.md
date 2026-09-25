---
status: backlog
modulo: public
owner:
criado-em: 2026-09-25
---

# 0112 — `public/AGENTS.md` é copiado para o build e publicado no deploy

**Task ID**: `TASK-0112`

**Prioridade**: P2

## Objetivo

Achado da `TASK-0096`: o Vite copia **todo** o conteúdo de `public/` para `dist/` sem
processamento. Com isso, `public/AGENTS.md` (documentação interna para agentes, 21 linhas) vira
`dist/AGENTS.md` a cada `npm run build`. A Vercel publica `dist/` (`vercel.json` →
`"outputDirectory": "dist"`), e arquivos estáticos têm precedência sobre o rewrite SPA
(`/((?!api).*)` → `/index.html`). Resultado: a documentação interna fica acessível
publicamente em `https://<domínio>/AGENTS.md`.

Hoje o conteúdo não tem segredo (descreve o `sw.js`), mas expõe detalhes internos e cria um
precedente arriscado: qualquer anotação futura nesse arquivo seria publicada sem ninguém
perceber. O `dist/` versionado no Git ainda não contém o arquivo (é anterior a ele); o risco está
no build da Vercel.

## Decisão em aberto (tomar na implementação, registrar em ADR se não for trivial)

- **(a) Mover a documentação para fora de `public/`**: por exemplo, um bloco sobre `public/`
  no `AGENTS.md` raiz ou em `docs/`, removendo `public/AGENTS.md`. É a opção mais simples e não
  depende de tooling. Exige ajustar a tabela de módulos do `AGENTS.md` raiz, que hoje aponta
  para `public/AGENTS.md`.
- **(b) Manter o arquivo e excluí-lo do build**: plugin/hook no `vite.config.ts` que remove
  `AGENTS.md` do `dist` após o build, ou mover os assets reais para outra pasta como
  `publicDir`. Preserva a convenção "um `AGENTS.md` por módulo", ao custo de uma regra de build
  que alguém pode desfazer sem perceber.

Em qualquer opção, o critério é o mesmo: nenhum `.md` de documentação dentro de `dist/`.

## Dependências

- Nenhuma.

## Critérios de conclusão

- [ ] `npm run build` não gera `dist/AGENTS.md` (nem outro `.md` de documentação em `dist/`).
- [ ] `public/sw.js` continua sendo copiado para `dist/sw.js` (push notifications não quebram).
- [ ] O conteúdo da documentação sobre `public/` continua acessível para agentes (no novo
      local, com o `AGENTS.md` raiz apontando para ele).
- [ ] Se for a opção (b), uma verificação automatizada (teste ou script) falha caso o `.md`
      volte a aparecer no `dist/`.
- [ ] Decisão registrada (ADR se houver regra de build nova).

## Referências

- `docs/tasks/0096-configurar-vitest-frontend.md` (onde o achado foi registrado).
- `vercel.json`, `vite.config.ts`, `public/AGENTS.md`, `AGENTS.md` (tabela de estrutura).

## Notas de progresso

- 2026-09-25 — Task criada a pedido do usuário, a partir do achado da `TASK-0096`.
  Conferido: a Vercel serve `dist/` e o arquivo estático tem precedência sobre o rewrite, então
  `/AGENTS.md` seria público; o `dist/` versionado no Git ainda não contém o arquivo.
