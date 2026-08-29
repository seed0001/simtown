// Interior maps, one per building, keyed by building id from registry.ts.
// Every building has its own dedicated entry so any single interior can be
// customized without touching the others. Coordinates are room-local: x runs
// left/right, z runs front/back, the door is centered on the +z wall.

export type FurnitureType =
  | 'bed'
  | 'table'
  | 'chair'
  | 'stool'
  | 'sofa'
  | 'rug'
  | 'counter'
  | 'fridge'
  | 'stove'
  | 'shelf'
  | 'plant'
  | 'lamp'
  | 'tv'
  | 'desk'
  | 'bench'
  | 'elevator'
  | 'board'

export interface FurnitureItem {
  type: FurnitureType
  position: [number, number] // x, z on the floor
  rotation?: number // radians around Y
  color?: string
  size?: number // length for counters/shelves/desks, radius for rugs
}

/**
 * A door inside an interior that leads to another interior (not the street).
 * It sits on a side wall; the player presses E to step through. Used to string
 * the school hallway together with its classrooms.
 */
export interface InteriorPortal {
  toId: string // interior id in INTERIORS
  label: string // shown on the look-at card and the sign above the door
  wall: 'left' | 'right' // -x wall or +x wall
  z: number // position along the corridor
}

export interface InteriorDef {
  width: number // x extent
  depth: number // z extent
  floorColor: string
  wallColor: string
  items: FurnitureItem[]
  // optional: a display name for the HUD when the interior isn't a street building
  name?: string
  // optional: doors to other interiors, along the side walls
  portals?: InteriorPortal[]
}

// ---------- layout helpers (defaults per building kind) ----------

function houseInterior(opts: { accent?: string; floor?: string; wall?: string } = {}): InteriorDef {
  const accent = opts.accent ?? '#8a5a3c'
  return {
    width: 12,
    depth: 9,
    floorColor: opts.floor ?? '#a87c52',
    wallColor: opts.wall ?? '#f0e6d2',
    items: [
      { type: 'bed', position: [-4.3, -2.5], color: accent },
      { type: 'lamp', position: [-5.3, -4.1] },
      { type: 'sofa', position: [-2, 2.4], rotation: Math.PI, color: accent },
      { type: 'tv', position: [-2, -0.8] },
      { type: 'rug', position: [-2, 0.8], size: 1.5, color: accent },
      { type: 'table', position: [3.2, 0.3] },
      { type: 'chair', position: [3.2, -0.9] },
      { type: 'chair', position: [3.2, 1.5], rotation: Math.PI },
      { type: 'counter', position: [4.4, -3.9], size: 3 },
      { type: 'stove', position: [2.2, -3.9] },
      { type: 'fridge', position: [5.45, -3.85] },
      { type: 'plant', position: [5.4, 3.9] },
    ],
  }
}

function dinerInterior(): InteriorDef {
  return {
    width: 18,
    depth: 12,
    floorColor: '#e8dcc4',
    wallColor: '#f2ede0',
    items: [
      { type: 'counter', position: [0, -1.5], size: 8, color: '#1f6b6b' },
      { type: 'stool', position: [-3, -0.2] },
      { type: 'stool', position: [-1.5, -0.2] },
      { type: 'stool', position: [0, -0.2] },
      { type: 'stool', position: [1.5, -0.2] },
      { type: 'stool', position: [3, -0.2] },
      { type: 'stove', position: [-2.5, -5.3] },
      { type: 'fridge', position: [-4.3, -5.25] },
      { type: 'counter', position: [1.5, -5.3], size: 5 },
      // booths along the right wall
      { type: 'table', position: [7.3, -3.5] },
      { type: 'bench', position: [7.3, -4.6], color: '#c23b3b' },
      { type: 'bench', position: [7.3, -2.4], color: '#c23b3b' },
      { type: 'table', position: [7.3, 0.5] },
      { type: 'bench', position: [7.3, -0.6], color: '#c23b3b' },
      { type: 'bench', position: [7.3, 1.6], color: '#c23b3b' },
      { type: 'table', position: [7.3, 4] },
      { type: 'bench', position: [7.3, 2.9], color: '#c23b3b' },
      { type: 'bench', position: [7.3, 5.1], color: '#c23b3b' },
      // free tables on the left
      { type: 'table', position: [-6, 1.5] },
      { type: 'chair', position: [-7.1, 1.5], rotation: Math.PI / 2 },
      { type: 'chair', position: [-4.9, 1.5], rotation: -Math.PI / 2 },
      { type: 'table', position: [-6, 4.2] },
      { type: 'chair', position: [-7.1, 4.2], rotation: Math.PI / 2 },
      { type: 'chair', position: [-4.9, 4.2], rotation: -Math.PI / 2 },
      { type: 'plant', position: [8.3, 5.3] },
      { type: 'plant', position: [-8.3, 5.3] },
    ],
  }
}

function gasShopInterior(): InteriorDef {
  return {
    width: 12,
    depth: 9,
    floorColor: '#c9c2ac',
    wallColor: '#eee2c8',
    items: [
      { type: 'shelf', position: [-1, -0.6], size: 6 },
      { type: 'shelf', position: [-1, 1.8], size: 6 },
      { type: 'fridge', position: [-3.2, -3.9] },
      { type: 'fridge', position: [-2.2, -3.9] },
      { type: 'fridge', position: [-1.2, -3.9] },
      { type: 'counter', position: [3.9, 2.6], size: 3, rotation: Math.PI / 2 },
      { type: 'plant', position: [-5.2, 3.8] },
    ],
  }
}

function shopInterior(opts: { accent?: string; floor?: string } = {}): InteriorDef {
  const accent = opts.accent ?? '#4a3a2a'
  return {
    width: 12,
    depth: 10,
    floorColor: opts.floor ?? '#b89868',
    wallColor: '#f0e6d2',
    items: [
      { type: 'shelf', position: [-5.2, -2], size: 4, rotation: Math.PI / 2 },
      { type: 'shelf', position: [-5.2, 2.2], size: 4, rotation: Math.PI / 2 },
      { type: 'shelf', position: [1, -2.8], size: 5 },
      { type: 'table', position: [0.5, 0.8] },
      { type: 'rug', position: [0.5, 0.8], size: 2, color: accent },
      { type: 'counter', position: [4.2, -3.2], size: 3, color: accent },
      { type: 'plant', position: [5.2, 4] },
    ],
  }
}

function officeLobbyInterior(opts: { accent?: string } = {}): InteriorDef {
  const accent = opts.accent ?? '#5f7080'
  return {
    width: 14,
    depth: 12,
    floorColor: '#b8c0c4',
    wallColor: '#e6ebee',
    items: [
      { type: 'desk', position: [0, -2.5], size: 4, color: accent },
      { type: 'chair', position: [0, -3.6], rotation: Math.PI },
      { type: 'elevator', position: [-1.3, -5.7] },
      { type: 'elevator', position: [1.3, -5.7] },
      { type: 'sofa', position: [-4.6, 1.5], rotation: Math.PI / 2, color: accent },
      { type: 'sofa', position: [4.6, 1.5], rotation: -Math.PI / 2, color: accent },
      { type: 'table', position: [0, 1.5] },
      { type: 'rug', position: [0, 1.5], size: 2.2, color: accent },
      { type: 'plant', position: [-6.2, -5.2] },
      { type: 'plant', position: [6.2, -5.2] },
      { type: 'plant', position: [-6.2, 5] },
      { type: 'plant', position: [6.2, 5] },
    ],
  }
}

function terminalInterior(): InteriorDef {
  const rows: FurnitureItem[] = []
  for (const x of [-3.4, 0, 3.4]) {
    rows.push({ type: 'bench', position: [x, 0.4], color: '#2a3540' })
    rows.push({ type: 'bench', position: [x, 2.4], rotation: Math.PI, color: '#2a3540' })
  }
  return {
    width: 16,
    depth: 10,
    floorColor: '#b8c0c4',
    wallColor: '#e6ebee',
    items: [
      // check-in counter along the airside wall
      { type: 'counter', position: [-4.2, -3.5], size: 5, color: '#3d4a52' },
      { type: 'shelf', position: [5, -3.5], size: 4 },
      { type: 'stool', position: [-4.2, -2.4], color: '#3d4a52' },
      ...rows,
      { type: 'plant', position: [-7, 3.7] },
      { type: 'plant', position: [7, 3.7] },
      { type: 'plant', position: [7.1, -3.6] },
      { type: 'lamp', position: [-7.1, -3.6] },
    ],
  }
}

// ---------- the school: a hallway interior that opens into one classroom per grade ----------

const GRADES: { key: string; label: string; teacher: string; board: string; palette: { floor: string; wall: string; accent: string } }[] = [
  { key: 'K',  label: 'Kindergarten', teacher: 'Ms. Opal Waverly',      board: 'letters · numbers to 20 · the weather calendar', palette: { floor: '#d9b98a', wall: '#fbeede', accent: '#f4a259' } },
  { key: '1',  label: 'Grade 1',      teacher: 'Mr. Dale Prentiss',     board: 'short vowels · adding within 20 · printing',      palette: { floor: '#d7c49a', wall: '#fbf1df', accent: '#f4c95d' } },
  { key: '2',  label: 'Grade 2',      teacher: 'Ms. Cora Ellison',      board: 'place value · telling time · life cycles',        palette: { floor: '#c9c9a6', wall: '#f2f4e6', accent: '#88c9a1' } },
  { key: '3',  label: 'Grade 3',      teacher: 'Mr. Wendell Hart',      board: 'multiplication · cursive · the solar system',     palette: { floor: '#b8c9c4', wall: '#e9f2ef', accent: '#5fb0b7' } },
  { key: '4',  label: 'Grade 4',      teacher: 'Ms. Priya Ramanan',     board: 'long division · fractions · the water cycle',     palette: { floor: '#b2c0d2', wall: '#e6ecf4', accent: '#5d8dc9' } },
  { key: '5',  label: 'Grade 5',      teacher: 'Mr. Julius Boone',      board: 'decimals · essay structure · ecosystems',         palette: { floor: '#bdb6d2', wall: '#ece9f4', accent: '#7b6cc9' } },
  { key: '6',  label: 'Grade 6',      teacher: 'Ms. Harriet Nkemelu',   board: 'ratios & rates · ancient civilizations',          palette: { floor: '#c9b6cc', wall: '#f1e9f2', accent: '#b56cc9' } },
  { key: '7',  label: 'Grade 7',      teacher: 'Mr. Sasha Vetrov',      board: 'proportions · cells · world geography',           palette: { floor: '#ccb6c2', wall: '#f2e9ee', accent: '#c96c9a' } },
  { key: '8',  label: 'Grade 8',      teacher: 'Ms. Delphine Marchetti', board: 'linear equations · chemistry basics · civics',    palette: { floor: '#ccb6b6', wall: '#f2e9e9', accent: '#c96c6c' } },
  { key: '9',  label: 'Grade 9',      teacher: 'Mr. Amos Fairbank',     board: 'Algebra I · biology · world literature',          palette: { floor: '#d2c0b2', wall: '#f4ece6', accent: '#d98d5d' } },
  { key: '10', label: 'Grade 10',     teacher: 'Ms. Rosalind Achebe',   board: 'geometry · chemistry · modern history',           palette: { floor: '#cec9a6', wall: '#f2f0e0', accent: '#c9b45d' } },
  { key: '11', label: 'Grade 11',     teacher: 'Mr. Ferdinand Klose',   board: 'Algebra II · physics · American literature',      palette: { floor: '#bcd2b6', wall: '#e9f2e6', accent: '#7fbf7f' } },
  { key: '12', label: 'Grade 12',     teacher: 'Ms. Ingrid Solberg',    board: 'pre-calculus · government & economics · capstone', palette: { floor: '#b6ccd6', wall: '#e6eef2', accent: '#5db1d9' } },
]

function classroomInterior(g: (typeof GRADES)[number]): InteriorDef {
  const W = 12
  const D = 11
  const items: FurnitureItem[] = [
    // chalkboard + teacher's desk against the back wall
    { type: 'board', position: [0.6, -D / 2 + 0.35], color: '#2f5d3a' },
    { type: 'desk', position: [-3.6, -D / 2 + 1.9], size: 2.2, color: '#6b4a30' },
    { type: 'chair', position: [-3.6, -D / 2 + 2.9], rotation: Math.PI, color: g.palette.accent },
    // reading / activity corner, front-right
    { type: 'rug', position: [3.5, 2.6], size: 1.9, color: g.palette.accent },
    { type: 'shelf', position: [5.3, 2.6], size: 3, rotation: Math.PI / 2 },
    { type: 'plant', position: [-5.2, 3.9] },
    { type: 'plant', position: [5.3, -3.8] },
  ]
  // student desks: three rows of three, facing the board
  const isLittle = g.key === 'K' || g.key === '1'
  const rows = isLittle ? 2 : 3
  for (let r = 0; r < rows; r++) {
    for (let c = -1; c <= 1; c++) {
      const x = c * 2.4
      const z = -1 + r * 2.1
      items.push({ type: 'table', position: [x, z] })
      items.push({ type: 'chair', position: [x, z + 0.85], rotation: Math.PI, color: isLittle ? g.palette.accent : '#6b4a30' })
    }
  }
  return {
    width: W,
    depth: D,
    floorColor: g.palette.floor,
    wallColor: g.palette.wall,
    name: `${g.label} Classroom`,
    items,
  }
}

function schoolHallInterior(): InteriorDef {
  const W = 6
  const D = 48
  const left = ['K', '1', '2', '3', '4', '5', '6']
  const right = ['7', '8', '9', '10', '11', '12']
  const portals: InteriorPortal[] = []
  left.forEach((key, i) => {
    const g = GRADES.find((x) => x.key === key)!
    portals.push({ toId: `central-1/${key}`, label: `${g.label} · ${g.teacher}`, wall: 'left', z: 19 - i * 6 })
  })
  right.forEach((key, i) => {
    const g = GRADES.find((x) => x.key === key)!
    portals.push({ toId: `central-1/${key}`, label: `${g.label} · ${g.teacher}`, wall: 'right', z: 16 - i * 6 })
  })
  return {
    width: W,
    depth: D,
    floorColor: '#d3ccbc',
    wallColor: '#e9e4d4',
    name: 'Simtown Public School',
    items: [
      { type: 'bench', position: [-1.7, 20], rotation: Math.PI / 2, color: '#3a5d8a' },
      { type: 'bench', position: [1.7, 20], rotation: -Math.PI / 2, color: '#3a5d8a' },
      { type: 'plant', position: [-2, 21.6] },
      { type: 'plant', position: [2, 21.6] },
      { type: 'plant', position: [-2, -21] },
      { type: 'plant', position: [2, -21] },
      { type: 'board', position: [0, -23.4], color: '#7a2020' },
    ],
    portals,
  }
}

// ---------- the index: building id -> its dedicated interior map ----------

export const INTERIORS: Record<string, InteriorDef> = {
  // Main Street houses
  'main-100': houseInterior({ accent: '#4a5560', floor: '#a87c52' }),
  'main-102': houseInterior({ accent: '#5c3a24', floor: '#b8905e', wall: '#f2e8d6' }),
  'main-106': houseInterior({ accent: '#8a5a52' }),
  'main-99': houseInterior({ accent: '#3e5c3e', wall: '#eee8d8' }),
  'main-101': houseInterior({ accent: '#8a6a3c', floor: '#c4a06c' }),
  'main-105': houseInterior({ accent: '#2f3e52', wall: '#e8eef4' }),
  // Oak Avenue houses
  'oak-203': houseInterior({ accent: '#33422c' }),
  'oak-207': houseInterior({ accent: '#5a4a30', wall: '#eee8d4' }),
  // Maple Avenue houses
  'maple-302': houseInterior({ accent: '#8a6420' }),
  'maple-306': houseInterior({ accent: '#4a3a24', wall: '#eaf0e0' }),
  // landmarks
  'main-112': dinerInterior(),
  'main-115': gasShopInterior(),
  'main-130': terminalInterior(),
  // Maple Avenue shops
  'maple-301': shopInterior({ accent: '#9b6bb3' }),
  'maple-305': shopInterior({ accent: '#6fa34a', floor: '#c4b088' }),
  'maple-311': shopInterior({ accent: '#c23b3b', floor: '#b89868' }),
  'maple-315': shopInterior({ accent: '#3a6ea5' }),
  // offices
  'main-118': officeLobbyInterior({ accent: '#4a6a80' }),
  'oak-202': officeLobbyInterior({ accent: '#3f6a7a' }),
  'oak-206': officeLobbyInterior({ accent: '#a8895e' }),
  'oak-210': officeLobbyInterior({ accent: '#4a5c68' }),
  'oak-214': officeLobbyInterior({ accent: '#8a76a0' }),
  // the school: a hallway plus one classroom per grade, reached through it
  'central-1': schoolHallInterior(),
  ...Object.fromEntries(GRADES.map((g) => [`central-1/${g.key}`, classroomInterior(g)])),
}

const FALLBACK = houseInterior()

export function getInterior(id: string): InteriorDef {
  return INTERIORS[id] ?? FALLBACK
}
