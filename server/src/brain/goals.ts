// Goals/behavior-leaning engine — ported and trimmed from Engines/behavior/drive_model_seed.py.
// Tracks a small set of standing concerns pulled straight from the resident's
// written persona (never invented here) with an intensity that shifts a little
// with events. Gives the LLM something concrete to be "on the mind of" instead
// of improvising motivations from nothing.

export interface Concern {
  /** short, persona-grounded description — must trace back to the resident's persona text */
  text: string
  intensity: number // 0-1
}

export interface GoalsState {
  concerns: Concern[]
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

export class GoalsEngine {
  private state: GoalsState

  constructor(initial: GoalsState) {
    this.state = initial
  }

  /** Nudge a concern's intensity by matching on its text; no-op if not found. */
  reinforce(text: string, delta: number): void {
    const concern = this.state.concerns.find((c) => c.text === text)
    if (concern) concern.intensity = clamp01(concern.intensity + delta)
  }

  topConcerns(n = 2): Concern[] {
    return [...this.state.concerns].sort((a, b) => b.intensity - a.intensity).slice(0, n)
  }

  describe(n = 2): string {
    const top = this.topConcerns(n).filter((c) => c.intensity > 0.15)
    if (top.length === 0) return 'nothing pressing'
    return top.map((c) => c.text).join('; ')
  }

  getState(): GoalsState {
    return this.state
  }
}
