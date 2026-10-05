import { describe, expect, it } from 'vitest'
import { easeInOutCubic, scrollTargetFor } from './scroll'

describe('easeInOutCubic', () => {
  it('starts at 0, ends at 1 and is symmetric around the midpoint', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5)
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1)
  })
})

describe('scrollTargetFor', () => {
  it('does not scroll when the element is already fully visible', () => {
    expect(scrollTargetFor({ top: 100, bottom: 500 }, 800, 300)).toBeNull()
  })

  it('brings an element below the fold to the top, keeping the margin', () => {
    expect(scrollTargetFor({ top: 700, bottom: 1100 }, 800, 300, 16)).toBe(984)
  })

  it('scrolls up to an element partially above the viewport', () => {
    expect(scrollTargetFor({ top: -50, bottom: 300 }, 800, 400, 16)).toBe(334)
  })

  it('never returns a negative position', () => {
    expect(scrollTargetFor({ top: -50, bottom: 300 }, 800, 10, 16)).toBe(0)
  })
})
