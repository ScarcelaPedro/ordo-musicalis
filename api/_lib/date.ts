// Brasil não observa horário de verão desde 2019, então um offset fixo é seguro
// e evita depender do fuso horário do processo do servidor (Vercel roda em UTC,
// mas o dev local pode rodar no fuso do sistema operacional).
const OFFSET_BRASILIA_MS = 3 * 60 * 60 * 1000

export function hojeBrasilia(): Date {
  const brasilia = new Date(Date.now() - OFFSET_BRASILIA_MS)
  return new Date(Date.UTC(brasilia.getUTCFullYear(), brasilia.getUTCMonth(), brasilia.getUTCDate()))
}
