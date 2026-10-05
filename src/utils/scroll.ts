// Gentle page scrolling (TASK-0118): the browser's native `behavior: 'smooth'` is fast and
// abrupt in Chromium, so the dashboard day card uses a slower eased animation instead.

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Page Y to scroll to so that `rect` (from getBoundingClientRect) sits `topMargin` px below the
 * top of the viewport, or null when the element is already fully visible (no needless motion).
 */
export function scrollTargetFor(
  rect: { top: number; bottom: number },
  viewportHeight: number,
  scrollY: number,
  topMargin = 16,
): number | null {
  if (rect.top >= 0 && rect.bottom <= viewportHeight) return null
  return Math.max(0, scrollY + rect.top - topMargin)
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Scrolls the window so `el` comes into view with an eased animation (instant under reduced motion). */
export function gentleScrollIntoView(el: Element, { duration = 700, topMargin = 16 } = {}): void {
  const target = scrollTargetFor(el.getBoundingClientRect(), window.innerHeight, window.scrollY, topMargin)
  if (target === null) return

  const start = window.scrollY
  const distance = target - start
  if (prefersReducedMotion() || duration <= 0) {
    window.scrollTo(0, target)
    return
  }

  let startTime: number | null = null
  // Any user scroll input cancels the animation so we never fight the user.
  let cancelled = false
  const cancel = () => { cancelled = true }
  const inputEvents = ['wheel', 'touchstart', 'keydown'] as const
  inputEvents.forEach(e => window.addEventListener(e, cancel, { once: true, passive: true }))
  const cleanup = () => inputEvents.forEach(e => window.removeEventListener(e, cancel))

  function step(now: number) {
    if (cancelled) return cleanup()
    if (startTime === null) startTime = now
    const progress = Math.min(1, (now - startTime) / duration)
    window.scrollTo(0, start + distance * easeInOutCubic(progress))
    if (progress < 1) requestAnimationFrame(step)
    else cleanup()
  }
  requestAnimationFrame(step)
}
