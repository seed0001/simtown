// Runs continuously while the server is up (SPEC.md §1: the world never
// stops). Every tick, checks each encounter rule against the real town
// clock; when one goes active, the two residents actually have a generated
// conversation — but not every tick a rule is active fires one, because
// SPEC.md §11 says conversation generation is budgeted, not automatic on
// every crossing. A per-pair cooldown enforces that.

import { nowTownTime, formatTownTime } from '../towndata/sim/clock.ts'
import { ENCOUNTER_RULES } from './encounters.ts'
import { getBrain } from '../residents/index.ts'
import { converse } from './converse.ts'

/** Minimum town-minutes between two generated conversations for the same pair. */
const COOLDOWN_TOWN_MINUTES = 6 * 60

const lastFiredAtAbsoluteMinute = new Map<string, number>()

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|')
}

async function tick(): Promise<void> {
  const t = nowTownTime()
  const absoluteMinute = t.day * 1440 + t.minuteOfDay

  for (const rule of ENCOUNTER_RULES) {
    if (!rule.isActive(t)) continue

    const key = pairKey(rule.a, rule.b)
    const last = lastFiredAtAbsoluteMinute.get(key)
    if (last !== undefined && absoluteMinute - last < COOLDOWN_TOWN_MINUTES) continue

    lastFiredAtAbsoluteMinute.set(key, absoluteMinute)
    console.log(`[scheduler] ${formatTownTime(t)} — ${rule.a} crosses paths with ${rule.b} (${rule.reason})`)

    try {
      const transcript = await converse(getBrain(rule.a), getBrain(rule.b))
      console.log(`[scheduler] recorded a ${transcript.length}-line conversation between ${rule.a} and ${rule.b}`)
    } catch (err) {
      console.error(`[scheduler] conversation between ${rule.a} and ${rule.b} failed:`, err)
    }
  }
}

let started = false

/** Start the background tick. Idempotent — calling twice is a no-op. */
export function startScheduler(tickMs = 15_000): void {
  if (started) return
  started = true
  setInterval(() => {
    tick().catch((err) => console.error('[scheduler] tick failed:', err))
  }, tickMs)
  console.log(`[scheduler] started, checking encounters every ${tickMs / 1000}s`)
}
