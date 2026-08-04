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

export interface FurnitureItem {
  type: FurnitureType
  position: [number, number] // x, z on the floor
  rotation?: number // radians around Y
  color?: string
  size?: number // length for counters/shelves/desks, radius for rugs
}

export interface InteriorDef {
  width: number // x extent
  depth: number // z extent
  floorColor: string
  wallColor: string
  items: FurnitureItem[]
}

// ---------- layout helpers (defaults per building kind) ----------

function houseInterior(opts: { accent?: string; floor?: string; wall?: string } = {}): InteriorDef {
  const accent = opts.accent ?? '#5e5e5e'
  return {
    width: 12,
    depth: 9,
    floorColor: opts.floor ?? '#8a8a8a',
    wallColor: opts.wall ?? '#e2e2e2',
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
    floorColor: '#b2b2b2',
    wallColor: '#eaeaea',
    items: [
      { type: 'counter', position: [0, -1.5], size: 8, color: '#5e5e5e' },
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
      { type: 'bench', position: [7.3, -4.6], color: '#5e5e5e' },
      { type: 'bench', position: [7.3, -2.4], color: '#5e5e5e' },
      { type: 'table', position: [7.3, 0.5] },
      { type: 'bench', position: [7.3, -0.6], color: '#5e5e5e' },
      { type: 'bench', position: [7.3, 1.6], color: '#5e5e5e' },
      { type: 'table', position: [7.3, 4] },
      { type: 'bench', position: [7.3, 2.9], color: '#5e5e5e' },
      { type: 'bench', position: [7.3, 5.1], color: '#5e5e5e' },
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
    floorColor: '#c0c0c0',
    wallColor: '#e8e8e8',
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
  const accent = opts.accent ?? '#3e3e3e'
  return {
    width: 12,
    depth: 10,
    floorColor: opts.floor ?? '#a8a8a8',
    wallColor: '#eaeaea',
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
  const accent = opts.accent ?? '#525252'
  return {
    width: 14,
    depth: 12,
    floorColor: '#9e9e9e',
    wallColor: '#e4e4e4',
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
    rows.push({ type: 'bench', position: [x, 0.4], color: '#4e4e4e' })
    rows.push({ type: 'bench', position: [x, 2.4], rotation: Math.PI, color: '#4e4e4e' })
  }
  return {
    width: 16,
    depth: 10,
    floorColor: '#aaaaaa',
    wallColor: '#e6e6e6',
    items: [
      // check-in counter along the airside wall
      { type: 'counter', position: [-4.2, -3.5], size: 5, color: '#5e5e5e' },
      { type: 'shelf', position: [5, -3.5], size: 4 },
      { type: 'stool', position: [-4.2, -2.4], color: '#5e5e5e' },
      ...rows,
      { type: 'plant', position: [-7, 3.7] },
      { type: 'plant', position: [7, 3.7] },
      { type: 'plant', position: [7.1, -3.6] },
      { type: 'lamp', position: [-7.1, -3.6] },
    ],
  }
}

// ---------- the index: building id -> its dedicated interior map ----------

export const INTERIORS: Record<string, InteriorDef> = {
  // Main Street houses
  'main-100': houseInterior({ accent: '#5a5a5a', floor: '#8a8a8a' }),
  'main-102': houseInterior({ accent: '#646464', floor: '#8e8e8e', wall: '#e4e4e4' }),
  'main-106': houseInterior({ accent: '#4e4e4e' }),
  'main-99': houseInterior({ accent: '#606060', wall: '#e0e0e0' }),
  'main-101': houseInterior({ accent: '#565656', floor: '#949494' }),
  'main-105': houseInterior({ accent: '#525252', wall: '#dcdcdc' }),
  // Oak Avenue houses
  'oak-203': houseInterior({ accent: '#606060' }),
  'oak-207': houseInterior({ accent: '#585858', wall: '#e6e6e6' }),
  // Maple Avenue houses
  'maple-302': houseInterior({ accent: '#5c5c5c' }),
  'maple-306': houseInterior({ accent: '#626262', wall: '#e8e8e8' }),
  // landmarks
  'main-112': dinerInterior(),
  'main-115': gasShopInterior(),
  'main-130': terminalInterior(),
  // Maple Avenue shops
  'maple-301': shopInterior({ accent: '#3e3e3e' }),
  'maple-305': shopInterior({ accent: '#484848', floor: '#b0b0b0' }),
  'maple-311': shopInterior({ accent: '#343434', floor: '#a2a2a2' }),
  'maple-315': shopInterior({ accent: '#525252' }),
  // offices
  'main-118': officeLobbyInterior({ accent: '#4a4a4a' }),
  'oak-202': officeLobbyInterior({ accent: '#525252' }),
  'oak-206': officeLobbyInterior({ accent: '#6e6e6e' }),
  'oak-210': officeLobbyInterior({ accent: '#505050' }),
  'oak-214': officeLobbyInterior({ accent: '#585858' }),
}

const FALLBACK = houseInterior()

export function getInterior(id: string): InteriorDef {
  return INTERIORS[id] ?? FALLBACK
}
