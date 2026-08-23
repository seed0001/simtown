// Emotion/drive engine — ported and trimmed from Engines/emotion/emotion_kernel_gramps.py.
// Dropped the AI-companion-specific drives (existential_dread, artifact_integration,
// narrative_coherence, identity_threat) that don't make sense for a person in a
// simulated town; kept the ones that describe an ordinary human's day.
//
// This is pure numeric state. The LLM never sets these values — it only reads
// a natural-language description of them. That's the point: how Marcus feels
// is computed here, not improvised by the model.

export type DriveName =
  | 'boredom'
  | 'curiosity'
  | 'loneliness'
  | 'affection'
  | 'anxiety'
  | 'competence'
  | 'playfulness'

export type Drives = Record<DriveName, number>

export interface EmotionState {
  drives: Drives
  updatedAtMs: number
}

const RESTING_POINT: Drives = {
  boredom: 0.3,
  curiosity: 0.4,
  loneliness: 0.3,
  affection: 0.4,
  anxiety: 0.25,
  competence: 0.6,
  playfulness: 0.35,
}

const DECAY_PER_HOUR = 0.05

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

// Labels ordered low to high; describe() picks one per drive by threshold.
const INTENSITY_LABELS: [number, string][] = [
  [0.2, 'barely'],
  [0.4, 'a little'],
  [0.6, 'somewhat'],
  [0.8, 'quite'],
  [1.01, 'very'],
]

function intensityLabel(value: number): string {
  return INTENSITY_LABELS.find(([ceiling]) => value < ceiling)?.[1] ?? 'very'
}

// How each drive reads in a sentence when it's elevated above resting.
const DRIVE_PHRASES: Record<DriveName, string> = {
  boredom: 'bored',
  curiosity: 'curious about things',
  loneliness: 'lonely',
  affection: 'warm toward people around him',
  anxiety: 'on edge',
  competence: 'confident in what he is doing',
  playfulness: 'in a playful mood',
}

export class EmotionEngine {
  private state: EmotionState

  constructor(initial?: EmotionState) {
    this.state = initial ?? { drives: { ...RESTING_POINT }, updatedAtMs: Date.now() }
  }

  private decay(): void {
    const now = Date.now()
    const hours = (now - this.state.updatedAtMs) / 3_600_000
    if (hours <= 0) return
    const pull = Math.min(1, DECAY_PER_HOUR * hours)
    const next: Drives = { ...this.state.drives }
    for (const key of Object.keys(next) as DriveName[]) {
      next[key] = clamp01(next[key] + (RESTING_POINT[key] - next[key]) * pull)
    }
    this.state = { drives: next, updatedAtMs: now }
  }

  /** Nudge drives by the given deltas (positive or negative), then re-anchor the decay clock. */
  update(deltas: Partial<Drives>): void {
    this.decay()
    const next: Drives = { ...this.state.drives }
    for (const [key, delta] of Object.entries(deltas) as [DriveName, number][]) {
      next[key] = clamp01(next[key] + delta)
    }
    this.state = { drives: next, updatedAtMs: Date.now() }
  }

  getState(): EmotionState {
    this.decay()
    return this.state
  }

  /** Natural-language read of only the drives currently displaced from resting — no invention, just a translation of the numbers. */
  describe(): string {
    this.decay()
    const lines: string[] = []
    for (const key of Object.keys(this.state.drives) as DriveName[]) {
      const value = this.state.drives[key]
      const restValue = RESTING_POINT[key]
      const displacement = value - restValue
      if (Math.abs(displacement) < 0.12) continue
      const label = intensityLabel(Math.abs(displacement) + 0.2)
      if (key === 'anxiety' || key === 'boredom' || key === 'loneliness') {
        lines.push(displacement > 0 ? `${label} ${DRIVE_PHRASES[key]}` : `not ${DRIVE_PHRASES[key]} at all right now`)
      } else {
        lines.push(displacement > 0 ? `${label} ${DRIVE_PHRASES[key]}` : `a bit low on feeling ${DRIVE_PHRASES[key]}`)
      }
    }
    return lines.length > 0 ? lines.join('; ') : 'steady, nothing unusual'
  }
}
