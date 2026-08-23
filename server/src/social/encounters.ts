// The "why do these two talk" layer. SPEC.md §5 says NPC-to-NPC conversations
// happen "when residents cross paths" — this file is what decides a crossing
// is happening, grounded in real schedule/relationship data, not a random
// roll or a manually-clicked button.
//
// Two kinds of rule:
//  - household co-presence: any two people who live together, active
//    whenever both are actually home (computed from their real shifts)
//  - a standing relationship: a specific seeded relationship note that
//    describes a recurring real-world reason two people would talk, tied to
//    the actual schedule fact that makes it true (a shift start, a delivery)
//
// Nothing here invents a reason. Every rule traces back to a fact already in
// client/src/city/residents.ts.

import { type TownTime } from '../../../client/src/sim/clock.ts'
import { getResident, isOnShiftAt } from '../../../client/src/city/residents.ts'

export interface EncounterRule {
  a: string
  b: string
  reason: string
  isActive(t: TownTime): boolean
}

function atHome(residentId: string, t: TownTime): boolean {
  return !isOnShiftAt(getResident(residentId)!, t.minuteOfWeek)
}

function household(residentId: string): string {
  return getResident(residentId)!.householdId
}

/** Two people who live together, active whenever both happen to be home at once. */
function householdRule(a: string, b: string, reason: string): EncounterRule {
  if (household(a) !== household(b)) {
    throw new Error(`encounters.ts: ${a} and ${b} don't actually share a household`)
  }
  return { a, b, reason, isActive: (t) => atHome(a, t) && atHome(b, t) }
}

export const ENCOUNTER_RULES: EncounterRule[] = [
  householdRule('marcus-ilori', 'nadia-ilori', 'married, share a home at 106 Main Street'),

  {
    a: 'marcus-ilori',
    b: 'theo-brandt',
    reason:
      "seeded relationship: \"The Bluebird buys its produce from the Green Grocer. The standing order is also a standing conversation.\"",
    isActive: (t) => {
      const marcus = getResident('marcus-ilori')!
      const theo = getResident('theo-brandt')!
      // the delivery/order window: theo's shop has just opened, and marcus is on shift to take it
      return isOnShiftAt(marcus, t.minuteOfWeek) && isOnShiftAt(theo, t.minuteOfWeek) && t.hour === theo.job.startHour
    },
  },
]
