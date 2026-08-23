import { fileURLToPath } from 'node:url'
import { ResidentBrain } from '../brain/residentBrain.ts'

// Seed concerns are paraphrased directly from each resident's persona text in
// client/src/city/residents.ts — nothing invented here that isn't already
// established there. This is the one manual step in bringing a new resident
// online; everything else (schedule, home, relationships, voice) is read
// straight from the single source of truth.
const SEED_CONCERNS: Record<string, string[]> = {
  'marcus-ilori': [
    "worried the Bluebird won't survive another bad winter",
    "the diner still isn't paid off after eleven years",
  ],
  'nadia-ilori': [
    "the Bluebird's margin is thinner than Marcus lets on",
    'keeping two sets of books straight, day and night',
  ],
  'theo-brandt': [
    'gave away too many discounts again this week',
    'confusing a busy store with a profitable one',
  ],
}

export const AVAILABLE_RESIDENT_IDS = Object.keys(SEED_CONCERNS)

const cache = new Map<string, ResidentBrain>()

export function getBrain(residentId: string): ResidentBrain {
  let brain = cache.get(residentId)
  if (!brain) {
    const seedConcerns = SEED_CONCERNS[residentId]
    if (!seedConcerns) {
      throw new Error(
        `no seed concerns defined for resident "${residentId}" — add them to server/src/residents/index.ts (available: ${AVAILABLE_RESIDENT_IDS.join(', ')})`,
      )
    }
    const statePath = fileURLToPath(new URL(`../../state/${residentId}.json`, import.meta.url))
    brain = new ResidentBrain(residentId, seedConcerns, statePath)
    cache.set(residentId, brain)
  }
  return brain
}
