// Simtown Municipal — the airfield east of town, and what flies into it.
//
// Layout constants and the flight schedule live here so the scenery, the
// aircraft, and any future traveler logic all read the same numbers. The
// terminal itself is a normal registry building (130 Main Street) so it gets an
// address, a door, and an interior like everything else; this file covers the
// pavement and the aircraft.
//
// Everything east of x=79 is airfield. The runway is a single north-south
// strip: aircraft land heading north and depart the same way, which is how a
// field this size actually works.

export interface Rect {
  /** centre */
  x: number
  z: number
  width: number
  depth: number
}

/** The strip. Aircraft land from the south (high z) and roll out north. */
export const RUNWAY = { x: 118, zStart: -80, zEnd: 20, width: 16 }

/** Links the runway to the apron. */
export const TAXIWAY = { z: -26, xStart: 101, xEnd: 110, width: 8 }

/** Parking pavement in front of the terminal. */
export const APRON: Rect = { x: 90, z: -26, width: 22, depth: 30 }

/** Painted circle on the apron. Kept clear of the apron edge and the stand. */
export const HELIPAD = { x: 86, z: -33, radius: 5 }

/** Where a fixed-wing aircraft parks. */
export const PLANE_STAND = { x: 94, z: -20 }

export const HANGAR = { x: 88, z: -48 }
export const TOWER = { x: 76, z: -32 }
export const WINDSOCK = { x: 104, z: -12 }

// ---------- flight paths ----------
// Nodes are keyed by fraction of the flight window rather than by distance, so
// the aircraft can sit still on the stand without the sampler racing through
// a zero-length segment. y is altitude, measured to the bottom of the wheels
// and skids, so ground level is a hair above zero — just enough to keep the
// gear from z-fighting the pavement, not enough to hover.

export interface FlightNode {
  /** fraction of the flight window, 0..1, ascending */
  at: number
  x: number
  y: number
  z: number
}

/** Arrive from the south, land, taxi in, park, taxi out, depart north. */
export const PLANE_PATH: FlightNode[] = [
  { at: 0.0, x: 118, y: 62, z: 168 },
  { at: 0.13, x: 118, y: 18, z: 68 },
  { at: 0.21, x: 118, y: 4, z: 26 },
  { at: 0.26, x: 118, y: 0.05, z: 10 }, // touchdown
  { at: 0.34, x: 118, y: 0.05, z: -24 }, // rollout
  { at: 0.38, x: 118, y: 0.05, z: -26 },
  { at: 0.44, x: 104, y: 0.05, z: -26 }, // taxi west
  { at: 0.5, x: 96, y: 0.05, z: -22 },
  { at: 0.53, x: PLANE_STAND.x, y: 0.05, z: PLANE_STAND.z }, // on stand
  { at: 0.73, x: PLANE_STAND.x, y: 0.05, z: PLANE_STAND.z }, // parked
  { at: 0.78, x: 100, y: 0.05, z: -25 }, // taxi out
  { at: 0.83, x: 112, y: 0.05, z: -26 },
  { at: 0.87, x: 118, y: 0.05, z: -30 }, // lined up
  { at: 0.93, x: 118, y: 1.4, z: -62 }, // rotate
  { at: 0.96, x: 118, y: 10, z: -84 },
  { at: 1.0, x: 118, y: 46, z: -150 },
]

/** In from the north-west, hover, settle on the pad, lift off the way it came. */
export const HELI_PATH: FlightNode[] = [
  { at: 0.0, x: 20, y: 45, z: -130 },
  { at: 0.22, x: 58, y: 26, z: -70 },
  { at: 0.36, x: 80, y: 14, z: -42 },
  { at: 0.44, x: HELIPAD.x, y: 8, z: HELIPAD.z }, // hover over the pad
  { at: 0.5, x: HELIPAD.x, y: 0.05, z: HELIPAD.z }, // down
  { at: 0.74, x: HELIPAD.x, y: 0.05, z: HELIPAD.z }, // shut down
  { at: 0.8, x: HELIPAD.x, y: 8, z: HELIPAD.z }, // lift
  { at: 0.88, x: 74, y: 18, z: -50 },
  { at: 1.0, x: 40, y: 42, z: -120 },
]

// ---------- the schedule ----------
// Fixed times, deterministic from the town clock, so the day costs no tokens
// (SPEC.md §11) and every client sees the same aircraft in the same place.
// Windows are spaced so two aircraft never share the field.

export type CraftKind = 'plane' | 'helicopter'

export interface Flight {
  id: string
  craft: CraftKind
  /** tail number, shown on the aircraft's label */
  tail: string
  /** minutes after midnight the arrival begins */
  startMinute: number
  /** whole arrive-park-depart cycle, in town minutes */
  duration: number
  /** days of the week it runs, 0 = Sunday */
  days: number[]
  livery: string
  accent: string
}

export const FLIGHTS: Flight[] = [
  {
    id: 'n417sb',
    craft: 'plane',
    tail: 'N417SB',
    startMinute: 7 * 60 + 40,
    duration: 70,
    days: [1, 2, 3, 4, 5],
    livery: '#e8e8e8',
    accent: '#525252',
  },
  {
    id: 'n9rm',
    craft: 'helicopter',
    tail: 'N9RM',
    startMinute: 9 * 60 + 30,
    duration: 45,
    days: [1, 3, 5],
    // light enough to read against its own dark canopy head-on
    livery: '#818181',
    accent: '#cfcfcf',
  },
  {
    id: 'n82j',
    craft: 'plane',
    tail: 'N82J',
    startMinute: 11 * 60 + 15,
    duration: 70,
    days: [0, 2, 4, 6],
    livery: '#dedede',
    accent: '#343434',
  },
  {
    id: 'n12ct',
    craft: 'helicopter',
    tail: 'N12CT',
    startMinute: 14 * 60,
    duration: 45,
    days: [0, 6],
    livery: '#464646',
    accent: '#e8e8e8',
  },
  {
    id: 'n55v',
    craft: 'plane',
    tail: 'N55V',
    startMinute: 16 * 60 + 20,
    duration: 70,
    days: [0, 1, 3, 5, 6],
    livery: '#e2e2e2',
    accent: '#565656',
  },
  {
    id: 'n301k',
    craft: 'plane',
    tail: 'N301K',
    startMinute: 19 * 60 + 5,
    duration: 70,
    days: [2, 4, 6],
    livery: '#d6d6d6',
    accent: '#6a6a6a',
  },
]

export function pathFor(craft: CraftKind): FlightNode[] {
  return craft === 'helicopter' ? HELI_PATH : PLANE_PATH
}
