import { Prisma } from '@prisma/client'

const LITURGIA_API_URL = process.env.LITURGIA_API_URL ?? 'https://liturgia.up.railway.app/v2'

interface LeituraExterna {
  referencia?: string
  titulo?: string
  refrao?: string
  texto?: string
  [key: string]: unknown
}

interface LiturgiaExterna {
  liturgia?: string
  cor?: string
  erro?: string
  oracoes?: { coleta?: string; oferendas?: string; comunhao?: string }
  // A API externa devolve cada leitura como um array (normalmente com 1 item -- múltiplos
  // itens ocorrem em dias com opções, ex: Natal), não como um objeto único.
  leituras?: {
    primeiraLeitura?: LeituraExterna[]
    salmo?: LeituraExterna[]
    segundaLeitura?: LeituraExterna[]
    evangelho?: LeituraExterna[]
  }
  antifonas?: { entrada?: string; comunhao?: string }
}

export interface LiturgiaFetched {
  data: Date
  liturgia: string
  cor: string
  temGloria: boolean
  temCredo: boolean
  antifonaEntrada: string | null
  coleta: string | null
  primeiraLeitura: LeituraExterna[] | null
  salmo: LeituraExterna[] | null
  segundaLeitura: LeituraExterna[] | null
  evangelho: LeituraExterna[] | null
  oferendas: string | null
  antifonaComunhao: string | null
  oracaoComunhao: string | null
}

// A API retorna [] quando não há 2ª leitura (dia comum), em vez de omitir o campo --
// normaliza pra null, que é o que o resto do sistema trata como "não há".
function arrayOuNull(arr: LeituraExterna[] | undefined): LeituraExterna[] | null {
  return arr && arr.length ? arr : null
}

// Algoritmo de Computus (Gregoriano) -- calcula o domingo de Páscoa pra localizar
// Quaresma e Advento, que mudam de data todo ano.
function pascoa(ano: number): Date {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(ano, mes - 1, dia))
}

function estaEmQuaresma(data: Date): boolean {
  const pascoaAno = pascoa(data.getUTCFullYear())
  const quartaDeCinzas = new Date(pascoaAno)
  quartaDeCinzas.setUTCDate(quartaDeCinzas.getUTCDate() - 46)
  const sabadoSanto = new Date(pascoaAno)
  sabadoSanto.setUTCDate(sabadoSanto.getUTCDate() - 1)
  return data >= quartaDeCinzas && data <= sabadoSanto
}

function estaEmAdvento(data: Date): boolean {
  const ano = data.getUTCFullYear()
  // 4º domingo do Advento = domingo em ou antes de 24/dez; os outros 3 ficam 7/14/21 dias antes.
  const quartoDomingo = new Date(Date.UTC(ano, 11, 24))
  while (quartoDomingo.getUTCDay() !== 0) quartoDomingo.setUTCDate(quartoDomingo.getUTCDate() - 1)
  const primeiroDomingo = new Date(quartoDomingo)
  primeiroDomingo.setUTCDate(primeiroDomingo.getUTCDate() - 21)
  const vesperaNatal = new Date(Date.UTC(ano, 11, 25))
  return data >= primeiroDomingo && data < vesperaNatal
}

// Glória: domingos fora de Advento/Quaresma, Solenidades e Festas.
// Credo (Profissão de Fé): domingos fora de Advento/Quaresma e Solenidades -- Festas não têm Credo.
function calcularGloriaCredo(data: Date, textoLiturgia: string): { gloria: boolean; credo: boolean } {
  const texto = textoLiturgia.toLowerCase()
  const solenidade = texto.includes('solenidade')
  const festa = texto.includes('festa')
  const domingoFestivo = data.getUTCDay() === 0 && !estaEmQuaresma(data) && !estaEmAdvento(data)

  return {
    gloria: domingoFestivo || solenidade || festa,
    credo: domingoFestivo || solenidade,
  }
}

// Prisma trata "campo Json ausente" e "campo Json = null" de formas diferentes -- pra gravar
// null de verdade num campo Json é preciso o marcador Prisma.JsonNull, não o `null` do JS.
export function toLiturgiaCreateInput(fetched: LiturgiaFetched): Prisma.LiturgiaUncheckedCreateInput {
  return {
    ...fetched,
    primeiraLeitura: (fetched.primeiraLeitura ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    salmo: (fetched.salmo ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    segundaLeitura: (fetched.segundaLeitura ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    evangelho: (fetched.evangelho ?? Prisma.JsonNull) as Prisma.InputJsonValue,
  }
}

export async function fetchLiturgiaExterna(data: Date): Promise<LiturgiaFetched | null> {
  const dia = data.getUTCDate()
  const mes = data.getUTCMonth() + 1
  const ano = data.getUTCFullYear()
  const url = `${LITURGIA_API_URL}/?dia=${dia}&mes=${mes}&ano=${ano}`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error('Falha ao buscar liturgia:', res.status, await res.text())
      return null
    }
    const json = (await res.json()) as LiturgiaExterna
    if (json.erro || !json.liturgia) {
      console.error('Liturgia não encontrada para a data:', url, json.erro)
      return null
    }

    const { gloria, credo } = calcularGloriaCredo(data, json.liturgia)

    return {
      data,
      liturgia: json.liturgia,
      cor: json.cor ?? 'Verde',
      temGloria: gloria,
      temCredo: credo,
      antifonaEntrada: json.antifonas?.entrada ?? null,
      coleta: json.oracoes?.coleta ?? null,
      primeiraLeitura: arrayOuNull(json.leituras?.primeiraLeitura),
      salmo: arrayOuNull(json.leituras?.salmo),
      segundaLeitura: arrayOuNull(json.leituras?.segundaLeitura),
      evangelho: arrayOuNull(json.leituras?.evangelho),
      oferendas: json.oracoes?.oferendas ?? null,
      antifonaComunhao: json.antifonas?.comunhao ?? null,
      oracaoComunhao: json.oracoes?.comunhao ?? null,
    }
  } catch (err) {
    console.error('Falha ao buscar liturgia:', err)
    return null
  }
}
