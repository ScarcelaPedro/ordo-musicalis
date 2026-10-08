import { describe, expect, it } from 'vitest'
import { partitionCoordinatorIds } from './communityScope'

describe('partitionCoordinatorIds', () => {
  const eligible = [
    { id: 1, userId: 10 },
    { id: 2, userId: null },
    { id: 3, userId: 30 },
  ]

  it('accepts only existing servers that have a login', () => {
    expect(partitionCoordinatorIds([1, 2, 3, 99], eligible)).toEqual({ valid: [1, 3], invalid: [2, 99] })
  })

  it('deduplicates and ignores non-numeric values', () => {
    expect(partitionCoordinatorIds([1, '1', 'x', -4, 3], eligible)).toEqual({ valid: [1, 3], invalid: [] })
  })

  it('treats a missing or non-array body as an empty list', () => {
    expect(partitionCoordinatorIds(undefined, eligible)).toEqual({ valid: [], invalid: [] })
    expect(partitionCoordinatorIds('1,2', eligible)).toEqual({ valid: [], invalid: [] })
  })
})
