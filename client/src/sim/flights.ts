// Which aircraft are at the field right now, and where.
//
// Same contract as sim/presence: pure functions of the town clock, so the
// schedule costs nothing to run and every client agrees. When the server takes
// over world state this becomes a reader of what the server says is flying.

import { FLIGHTS, pathFor, type Flight, type FlightNode } from '../city/airport'
import { inWeekWindow, windowProgress, type TownTime } from './clock'

export interface Attitude {
  x: number
  y: number
  z: number
  /** Y rotation for a model that faces +z in local space. */
  heading: number
  /** nose-up angle in radians, positive climbing */
  pitch: number
}

export interface AircraftState extends Attitude {
  flight: Flight
  progress: number
  /** on the pavement rather than in the air */
  onGround: boolean
}

const GROUND_Y = 1.2

/** Every window this flight occupies during a week, in minutes-of-week. */
function spansOf(f: Flight): { start: number; end: number }[] {
  return f.days.map((d) => {
    const start = d * 1440 + f.startMinute
    return { start, end: start + f.duration }
  })
}

/**
 * Position and attitude at `t` (0..1) through a flight path. Nodes are spaced
 * by time, not distance, so a parked aircraft holds still. Heading is carried
 * from the last segment that actually moved — otherwise a helicopter dropping
 * straight down would snap to facing north.
 */
export function sampleFlight(nodes: FlightNode[], t: number): Attitude {
  const clamped = Math.max(0, Math.min(1, t))

  let i = 0
  while (i < nodes.length - 2 && nodes[i + 1].at <= clamped) i++
  const a = nodes[i]
  const b = nodes[i + 1] ?? a
  const span = b.at - a.at
  const f = span <= 0 ? 0 : (clamped - a.at) / span

  const x = a.x + (b.x - a.x) * f
  const y = a.y + (b.y - a.y) * f
  const z = a.z + (b.z - a.z) * f

  // heading from this segment, or the most recent one with horizontal movement
  let heading = 0
  let pitch = 0
  for (let j = i; j >= 0; j--) {
    const p = nodes[j]
    const q = nodes[j + 1]
    if (!q) continue
    const dx = q.x - p.x
    const dz = q.z - p.z
    const flat = Math.hypot(dx, dz)
    if (flat < 0.01) continue
    heading = Math.atan2(dx, dz)
    if (j === i) pitch = Math.atan2(q.y - p.y, flat)
    break
  }
  return { x, y, z, heading, pitch: Math.max(-0.5, Math.min(0.5, pitch)) }
}

/** Where a single flight is right now, or null when it isn't running. */
export function flightStateOf(flight: Flight, t: TownTime): AircraftState | null {
  for (const span of spansOf(flight)) {
    if (!inWeekWindow(t.minuteOfWeek, span.start, span.end)) continue
    const progress = windowProgress(t.minuteOfWeek, span.start, flight.duration)
    const at = sampleFlight(pathFor(flight.craft), progress)
    return { ...at, flight, progress, onGround: at.y <= GROUND_Y }
  }
  return null
}

/** Aircraft currently at or over the field. Usually none, sometimes one. */
export function activeFlights(t: TownTime): AircraftState[] {
  const out: AircraftState[] = []
  for (const flight of FLIGHTS) {
    const state = flightStateOf(flight, t)
    if (state) out.push(state)
  }
  return out
}

/** The next flight due after `t`, for a HUD or an arrivals board. */
export function nextFlight(t: TownTime): { flight: Flight; inMinutes: number } | null {
  let best: { flight: Flight; inMinutes: number } | null = null
  for (const flight of FLIGHTS) {
    for (const span of spansOf(flight)) {
      const wait = (((span.start - t.minuteOfWeek) % 10080) + 10080) % 10080
      if (!best || wait < best.inMinutes) best = { flight, inMinutes: wait }
    }
  }
  return best
}
