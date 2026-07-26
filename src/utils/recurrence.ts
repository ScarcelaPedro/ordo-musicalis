export const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
// Domingo e Sábado são masculinos; os demais dias (segunda-feira etc.) são femininos.
export const DIA_MASCULINO = [true, false, false, false, false, false, true]
export const ORDINAIS_M = ['1º', '2º', '3º', '4º', '5º']
export const ORDINAIS_F = ['1ª', '2ª', '3ª', '4ª', '5ª']

export function recorrenciaLabel(t: { diaSemana: number; tipoRecorrencia: string; ordinal?: number | null }) {
  const masculino = DIA_MASCULINO[t.diaSemana]
  if (t.tipoRecorrencia === 'mensal_ordinal') {
    const ordinal = (masculino ? ORDINAIS_M : ORDINAIS_F)[(t.ordinal ?? 1) - 1]
    return `${ordinal} ${DIAS[t.diaSemana]} do mês`
  }
  return `${masculino ? 'Todo' : 'Toda'} ${DIAS[t.diaSemana]}`
}
