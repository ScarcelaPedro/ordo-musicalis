Ver também o [AGENTS.md raiz](../AGENTS.md).

## Propósito

Assets estáticos servidos como estão pela raiz do domínio (`/`), sem passar pelo pipeline de build do Vite — tudo aqui é copiado diretamente para `dist/` no `npm run build`.

## Conteúdo

- [`sw.js`](sw.js) — Service Worker de notificações push. Registrado pelo frontend em [`src/utils/push.ts`](../src/AGENTS.md) via `navigator.serviceWorker.register('/sw.js')`. Escuta dois eventos:
  - `push` — recebe o payload (`title`, `body`, `url`) enviado pela API (`api/_lib/sendPush.ts`, ver [`api/AGENTS.md`](../api/AGENTS.md)) e exibe a notificação do navegador.
  - `notificationclick` — ao clicar na notificação, foca uma aba já aberta com a URL de destino ou abre uma nova.

⚠️ **`favicon.svg` está referenciado mas não existe**: [`index.html`](../index.html) na raiz aponta `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`, mas não há nenhum arquivo `favicon.svg` em `public/` (nem em nenhum outro lugar do repositório). O ícone da aba do navegador atualmente não carrega. Corrigir é uma tarefa pequena e não ambígua (adicionar o arquivo em `public/favicon.svg`), mas fica registrada aqui em vez de "corrigida" silenciosamente, já que envolve escolher/gerar um ícone real.

## Configuração

Nenhuma — arquivos estáticos puros, sem variáveis de ambiente ou build step próprio.

## Convenções

Qualquer novo arquivo estático (imagens, manifest PWA, robots.txt etc.) que precise ser servido a partir da raiz do domínio, sem processamento do Vite, vai aqui.
