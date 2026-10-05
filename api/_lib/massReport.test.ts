import { describe, expect, it } from 'vitest'
import { buildMassReport, celebranteTipo, celebrationKind, MassReportScale } from './massReport'

const matriz = { id: 1, nome: 'Matriz' }
const capela = { id: 2, nome: 'Capela São José' }
const peJoao = { id: 10, nome: 'Pe. João' }
const diacPaulo = { id: 20, nome: 'Diác. Paulo' }

describe('celebranteTipo', () => {
  it('recognizes priest and deacon titles', () => {
    expect(celebranteTipo('Pe. João')).toBe('padre')
    expect(celebranteTipo('pe joão')).toBe('padre')
    expect(celebranteTipo('Padre Antônio')).toBe('padre')
    expect(celebranteTipo('Diac. Paulo')).toBe('diacono')
    expect(celebranteTipo('Diác. Paulo')).toBe('diacono')
    expect(celebranteTipo('Diácono Pedro')).toBe('diacono')
  })

  it('does not match names that only start with the title letters', () => {
    expect(celebranteTipo('Pedro Silva')).toBe('outro')
    expect(celebranteTipo('Diacuí Souza')).toBe('outro')
  })
})

describe('celebrationKind', () => {
  it('uses the celebrant title over the celebration name', () => {
    expect(celebrationKind({ celebracao: 'Celebração dominical', celebrante: peJoao })).toBe('missa')
    expect(celebrationKind({ celebracao: 'Celebração dominical', celebrante: diacPaulo })).toBe('palavra')
  })

  it('falls back to the celebration name without a known celebrant', () => {
    expect(celebrationKind({ celebracao: 'Santa Missa', celebrante: null })).toBe('missa')
    expect(celebrationKind({ celebracao: 'Celebração da Palavra', celebrante: null })).toBe('palavra')
    expect(celebrationKind({ celebracao: 'Adoração', celebrante: null })).toBe('outra')
  })
})

describe('buildMassReport', () => {
  const scales: MassReportScale[] = [
    { celebracao: 'Missa', comunidade: matriz, celebrante: peJoao },
    { celebracao: 'Missa', comunidade: matriz, celebrante: peJoao },
    { celebracao: 'Celebração da Palavra', comunidade: capela, celebrante: diacPaulo },
    { celebracao: 'Missa', comunidade: capela, celebrante: peJoao },
    { celebracao: 'Terço', comunidade: capela, celebrante: null },
  ]
  const report = buildMassReport(scales)

  it('counts totals by kind', () => {
    expect(report.totalMissas).toBe(3)
    expect(report.totalCelebracoesPalavra).toBe(1)
    expect(report.totalOutras).toBe(1)
  })

  it('counts each kind per community', () => {
    expect(report.porComunidade).toEqual([
      { comunidadeId: 2, nome: 'Capela São José', missas: 1, celebracoesPalavra: 1, outras: 1 },
      { comunidadeId: 1, nome: 'Matriz', missas: 2, celebracoesPalavra: 0, outras: 0 },
    ])
  })

  it('counts masses per priest and liturgies of the word per deacon', () => {
    expect(report.porCelebrante).toEqual([
      { celebranteId: 10, nome: 'Pe. João', tipo: 'padre', missas: 3, celebracoesPalavra: 0 },
      { celebranteId: 20, nome: 'Diác. Paulo', tipo: 'diacono', missas: 0, celebracoesPalavra: 1 },
    ])
  })
})
