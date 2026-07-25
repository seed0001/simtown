// Walking routes between two doors, along the street grid.
//
// PLACEHOLDER: this is not pathfinding. It builds an L- or Z-shaped route out
// of the known grid in registry.ts — out to your sidewalk, along it, up a
// cross street if needed, then in to the far door. Good enough to keep people
// off the grass and out of walls until the server owns movement.

import { STREETS } from '../city/registry'

export interface Point {
  x: number
  z: number
}

/** ROAD_HALF (4) + 0.9, matching the sidewalk strips in scene/Props.tsx. */
const SIDEWALK_OFFSET = 4.9

const EW_Z = STREETS.ew.map((s) => s.z)
const NS_X = STREETS.ns.map((s) => s.x)

function nearest(values: number[], v: number): number {
  return values.reduce((best, cur) => (Math.abs(cur - v) < Math.abs(best - v) ? cur : best))
}

/** The sidewalk lane nearest to `v`: a street centerline offset to the side `v` sits on. */
function laneNear(centerlines: number[], v: number): number {
  const center = nearest(centerlines, v)
  return center + (v >= center ? SIDEWALK_OFFSET : -SIDEWALK_OFFSET)
}

/** Waypoints from one door to another. Always starts at `from` and ends at `to`. */
export function routeBetween(from: Point, to: Point): Point[] {
  const laneA = laneNear(EW_Z, from.z)
  const laneB = laneNear(EW_Z, to.z)
  const path: Point[] = [from, { x: from.x, z: laneA }]

  if (Math.abs(laneA - laneB) > 0.01) {
    // different east-west sidewalks: cut across on a north-south one
    const crossX = laneNear(NS_X, (from.x + to.x) / 2)
    path.push({ x: crossX, z: laneA }, { x: crossX, z: laneB })
  }

  path.push({ x: to.x, z: laneB }, to)
  return dedupe(path)
}

function dedupe(path: Point[]): Point[] {
  const out: Point[] = []
  for (const p of path) {
    const last = out[out.length - 1]
    if (!last || Math.hypot(p.x - last.x, p.z - last.z) > 0.01) out.push(p)
  }
  return out.length >= 2 ? out : path.slice(0, 2)
}

export interface Waypoint extends Point {
  /** Y rotation for a body that faces +z in local space. */
  heading: number
}

/** Position and facing at `t` (0..1) along a route, spaced by distance walked. */
export function sampleRoute(path: Point[], t: number): Waypoint {
  const clamped = Math.max(0, Math.min(1, t))
  const legs: number[] = []
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z)
    legs.push(d)
    total += d
  }
  if (total === 0) return { ...path[0], heading: 0 }

  let travelled = clamped * total
  for (let i = 0; i < legs.length; i++) {
    if (travelled > legs[i] && i < legs.length - 1) {
      travelled -= legs[i]
      continue
    }
    const a = path[i]
    const b = path[i + 1]
    const f = legs[i] === 0 ? 0 : Math.min(1, travelled / legs[i])
    return {
      x: a.x + (b.x - a.x) * f,
      z: a.z + (b.z - a.z) * f,
      heading: Math.atan2(b.x - a.x, b.z - a.z),
    }
  }
  const last = path[path.length - 1]
  return { ...last, heading: 0 }
}
