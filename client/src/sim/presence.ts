// Where every resident is right now.
//
// PLACEHOLDER: SPEC.md §4 says daytime is deterministic execution of a plan the
// LLM wrote overnight, and §2 that the server owns position. Neither exists
// yet, so presence is derived straight from each resident's shift: on the clock
// means at the workplace, otherwise at home, with a short walk in between. It
// is a stand-in for plan execution, not the beginning of one — when the server
// starts sending positions, this file goes away.

import { addressOf, doorWorld, getBuilding } from '../city/registry'
import type { FurnitureItem, FurnitureType, InteriorDef } from '../city/interiors'
import {
  RESIDENTS,
  homeOf,
  inWeekWindow,
  shiftSpans,
  workplaceOf,
  type Resident,
} from '../city/residents'
import { routeBetween, sampleRoute, type Point, type Waypoint } from './routes'
import { windowProgress, type TownTime } from './clock'

/** Town minutes a resident spends walking to or from work. */
export const COMMUTE_MINUTES = 30

export type Presence =
  | { kind: 'indoors'; buildingId: string }
  | { kind: 'commuting'; fromId: string; toId: string; toWork: boolean; progress: number }

export function presenceOf(r: Resident, t: TownTime): Presence {
  const home = homeOf(r)
  const work = workplaceOf(r)
  if (!home || !work) return { kind: 'indoors', buildingId: home?.id ?? work?.id ?? '' }

  const now = t.minuteOfWeek
  for (const span of shiftSpans(r)) {
    const leaveHome = span.start - COMMUTE_MINUTES
    if (inWeekWindow(now, leaveHome, span.start)) {
      return {
        kind: 'commuting',
        fromId: home.id,
        toId: work.id,
        toWork: true,
        progress: windowProgress(now, leaveHome, COMMUTE_MINUTES),
      }
    }
    if (inWeekWindow(now, span.start, span.end)) {
      return { kind: 'indoors', buildingId: work.id }
    }
    if (inWeekWindow(now, span.end, span.end + COMMUTE_MINUTES)) {
      return {
        kind: 'commuting',
        fromId: work.id,
        toId: home.id,
        toWork: false,
        progress: windowProgress(now, span.end, COMMUTE_MINUTES),
      }
    }
  }
  return { kind: 'indoors', buildingId: home.id }
}

// Routes only depend on the two doors, so build each one once.
const routeCache = new Map<string, Point[]>()

function cachedRoute(fromId: string, toId: string): Point[] | null {
  const key = `${fromId}->${toId}`
  const hit = routeCache.get(key)
  if (hit) return hit
  const from = getBuilding(fromId)
  const to = getBuilding(toId)
  if (!from || !to) return null
  const route = routeBetween(doorWorld(from), doorWorld(to))
  routeCache.set(key, route)
  return route
}

/** World position of a resident who is outdoors, or null when they are inside. */
export function outdoorPositionOf(r: Resident, t: TownTime): Waypoint | null {
  const p = presenceOf(r, t)
  if (p.kind !== 'commuting') return null
  const route = cachedRoute(p.fromId, p.toId)
  return route ? sampleRoute(route, p.progress) : null
}

/** Everyone inside a given building right now, in a stable order. */
export function occupantsOf(buildingId: string, t: TownTime): Resident[] {
  return RESIDENTS.filter((r) => {
    const p = presenceOf(r, t)
    return p.kind === 'indoors' && p.buildingId === buildingId
  })
}

// ---------- standing spots ----------
// People stand on clear floor. Each interior already lists its furniture, so
// spots are scored by how far they sit from the nearest piece rather than
// guessed at — otherwise residents end up inside the sofa.

/** Rough floor radius per furniture type, in metres. Rugs are walked on. */
const FOOTPRINT: Record<FurnitureType, number> = {
  bed: 1.5,
  table: 0.9,
  chair: 0.4,
  stool: 0.35,
  sofa: 1.05,
  rug: 0,
  counter: 0.6,
  fridge: 0.55,
  stove: 0.55,
  shelf: 0.6,
  plant: 0.4,
  lamp: 0.35,
  tv: 0.7,
  desk: 0.7,
  bench: 0.8,
  elevator: 0.8,
  board: 0.3,
}

function footprintOf(item: FurnitureItem): number {
  const base = FOOTPRINT[item.type] ?? 0.5
  const long = item.type === 'counter' || item.type === 'shelf' || item.type === 'desk'
  return long && item.size ? Math.max(base, item.size / 2) : base
}

/** Distance from (x, z) to the nearest furniture edge; higher is roomier. */
function clearanceAt(def: InteriorDef, x: number, z: number): number {
  let worst = Infinity
  for (const item of def.items) {
    const r = footprintOf(item)
    if (r === 0) continue
    const d = Math.hypot(x - item.position[0], z - item.position[1]) - r
    if (d < worst) worst = d
  }
  return worst
}

const SPOT_MARGIN = 0.75 // keep clear of the walls
const MIN_SEPARATION = 1.15 // personal space between two residents
const MIN_LATERAL = 0.9 // and side-to-side, so nobody hides directly behind anyone
const MIN_CLEARANCE = 0.6 // how much open floor a person needs around them
const spotCache = new Map<string, Waypoint[]>()

/**
 * Up to `count` standing spots for a room's occupants. Anywhere too close to
 * furniture is rejected outright, and of what's left the most central spots
 * win — scoring on clearance alone lines everyone up against the back wall,
 * which is where the empty floor is. Everyone faces the entrance. Cached per
 * building and occupant count; layouts never change at runtime.
 */
export function standingSpots(buildingId: string, def: InteriorDef, count: number): Waypoint[] {
  const key = `${buildingId}:${count}`
  const hit = spotCache.get(key)
  if (hit) return hit

  const candidates: { x: number; z: number; clear: number }[] = []
  const stepX = def.width / 16
  const stepZ = def.depth / 14
  for (let x = -def.width / 2 + SPOT_MARGIN; x <= def.width / 2 - SPOT_MARGIN; x += stepX) {
    for (let z = -def.depth / 2 + SPOT_MARGIN; z <= def.depth / 2 - SPOT_MARGIN; z += stepZ) {
      // leave the doorway and the spot the player spawns on free
      if (Math.abs(x) < 1.3 && z > def.depth / 2 - 2.6) continue
      candidates.push({ x, z, clear: clearanceAt(def, x, z) })
    }
  }

  const roomy = candidates.filter((c) => c.clear >= MIN_CLEARANCE)
  // fall back to whatever is least cramped if the room is wall-to-wall furniture
  const pool = roomy.length ? roomy : candidates.slice().sort((a, b) => b.clear - a.clear)
  // most central first, so occupants gather in the open middle of the room
  pool.sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z))

  const chosen: Waypoint[] = []
  for (const c of pool) {
    if (chosen.length >= count) break
    const crowded = chosen.some(
      (s) => Math.hypot(s.x - c.x, s.z - c.z) < MIN_SEPARATION || Math.abs(s.x - c.x) < MIN_LATERAL,
    )
    if (crowded) continue
    chosen.push({ x: c.x, z: c.z, heading: 0 })
  }
  // stable left-to-right order so a resident keeps their spot as others come and go
  chosen.sort((a, b) => a.x - b.x)

  spotCache.set(key, chosen)
  return chosen
}

/** Room-local position of a resident inside `buildingId`, or null if they are elsewhere. */
export function indoorPositionOf(
  r: Resident,
  t: TownTime,
  buildingId: string,
  def: InteriorDef,
): Waypoint | null {
  const here = occupantsOf(buildingId, t)
  const index = here.findIndex((o) => o.id === r.id)
  if (index === -1) return null
  const spots = standingSpots(buildingId, def, here.length)
  return spots[index] ?? spots[spots.length - 1] ?? null
}

/** Short human-readable status, for the HUD and the look-at card. */
export function describePresence(r: Resident, t: TownTime): string {
  const p = presenceOf(r, t)
  if (p.kind === 'commuting') {
    const dest = getBuilding(p.toId)
    return p.toWork
      ? `walking to work · ${dest?.name ?? 'work'}`
      : `walking home · ${dest ? addressOf(dest) : 'home'}`
  }
  const here = getBuilding(p.buildingId)
  if (!here) return 'somewhere in town'
  const atWork = p.buildingId === r.job.workplaceId
  return atWork ? `at work · ${here.name}` : `at home · ${addressOf(here)}`
}
