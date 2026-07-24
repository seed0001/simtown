// Single source of truth for every building in SimTown.
// Each building has a stable id, a street address, and a door position.
// To edit a building, find it here by address; its interior map lives in
// interiors.ts under the same id.

export type BuildingKind = 'house' | 'restaurant' | 'gasstation' | 'shop' | 'office'

export interface BuildingEntry {
  id: string
  kind: BuildingKind
  name: string
  number: number
  street: string
  position: [number, number, number]
  rotation: number // radians around Y; buildings face +z in local space
  colors?: { body?: string; roof?: string; awning?: string }
  size?: { width?: number; depth?: number; height?: number }
}

export const STREETS = {
  ew: [
    { z: -36, name: 'Oak Avenue' },
    { z: 0, name: 'Main Street' },
    { z: 36, name: 'Maple Avenue' },
  ],
  ns: [
    { x: -36, name: 'Elm Street' },
    { x: 0, name: 'Central Boulevard' },
    { x: 36, name: 'Birch Street' },
  ],
}

export const BUILDINGS: BuildingEntry[] = [
  // ---------- Main Street, north side ----------
  { id: 'main-100', kind: 'house', name: 'Larkspur House', number: 100, street: 'Main Street', position: [-48, 0, -12], rotation: 0, colors: { body: '#e0d0b8', roof: '#7a5a48' } },
  { id: 'main-102', kind: 'house', name: 'Cedar Cottage', number: 102, street: 'Main Street', position: [-25, 0, -12], rotation: 0, colors: { body: '#cfe0d0', roof: '#5a6b5a' } },
  { id: 'main-106', kind: 'house', name: 'Rosewood House', number: 106, street: 'Main Street', position: [-14, 0, -12], rotation: 0, colors: { body: '#e8d8b0', roof: '#8c4a3c' } },
  { id: 'main-112', kind: 'restaurant', name: 'Bluebird Diner', number: 112, street: 'Main Street', position: [16, 0, -12], rotation: 0 },
  { id: 'main-118', kind: 'office', name: 'Eastview Offices', number: 118, street: 'Main Street', position: [48, 0, -14], rotation: 0, colors: { body: '#93a89b' }, size: { height: 17 } },
  // ---------- Main Street, south side ----------
  { id: 'main-99', kind: 'house', name: 'Aspen Cottage', number: 99, street: 'Main Street', position: [-48, 0, 12], rotation: Math.PI, colors: { body: '#ccdce0', roof: '#4a6a72' } },
  { id: 'main-101', kind: 'house', name: 'Hazel House', number: 101, street: 'Main Street', position: [-25, 0, 12], rotation: Math.PI, colors: { body: '#ecd8c8', roof: '#8c5a3c' } },
  { id: 'main-105', kind: 'house', name: 'Bluebell Cottage', number: 105, street: 'Main Street', position: [-14, 0, 12], rotation: Math.PI, colors: { body: '#c8d8ec', roof: '#4a5a78' } },
  { id: 'main-115', kind: 'gasstation', name: 'Gas & Go', number: 115, street: 'Main Street', position: [17, 0, 13], rotation: Math.PI },
  // ---------- Oak Avenue, south side ----------
  { id: 'oak-203', kind: 'house', name: 'Juniper House', number: 203, street: 'Oak Avenue', position: [-25, 0, -25], rotation: Math.PI, colors: { body: '#f0e0c8', roof: '#a05a3c' } },
  { id: 'oak-207', kind: 'house', name: 'Willow House', number: 207, street: 'Oak Avenue', position: [-14, 0, -25], rotation: Math.PI, colors: { body: '#dbc6e0', roof: '#6b5a7a' } },
  // ---------- Oak Avenue, north side (downtown) ----------
  { id: 'oak-202', kind: 'office', name: 'Meridian Offices', number: 202, street: 'Oak Avenue', position: [-24, 0, -48], rotation: 0, colors: { body: '#8fa3b8' }, size: { height: 15 } },
  { id: 'oak-206', kind: 'office', name: 'Sandstone Tower', number: 206, street: 'Oak Avenue', position: [-11, 0, -48], rotation: 0, colors: { body: '#a89f94' }, size: { height: 21 } },
  { id: 'oak-210', kind: 'office', name: 'Northgate Tower', number: 210, street: 'Oak Avenue', position: [12, 0, -48], rotation: 0, colors: { body: '#7d8ea0' }, size: { height: 18 } },
  { id: 'oak-214', kind: 'office', name: 'Lavender Plaza', number: 214, street: 'Oak Avenue', position: [25, 0, -48], rotation: 0, colors: { body: '#b0a8b8' }, size: { height: 13, width: 11 } },
  // ---------- Maple Avenue, north side ----------
  { id: 'maple-302', kind: 'house', name: 'Honey House', number: 302, street: 'Maple Avenue', position: [-25, 0, 25], rotation: 0, colors: { body: '#e8ccc0', roof: '#9c4a4a' } },
  { id: 'maple-306', kind: 'house', name: 'Fern Cottage', number: 306, street: 'Maple Avenue', position: [-14, 0, 25], rotation: 0, colors: { body: '#d8e8c8', roof: '#5a7a4a' } },
  // ---------- Maple Avenue, south side (shops) ----------
  { id: 'maple-301', kind: 'shop', name: 'Violet Boutique', number: 301, street: 'Maple Avenue', position: [-20, 0, 45], rotation: Math.PI, colors: { body: '#c9b8d8', awning: '#6c5ce7' } },
  { id: 'maple-305', kind: 'shop', name: 'Green Grocer', number: 305, street: 'Maple Avenue', position: [-10, 0, 45], rotation: Math.PI, colors: { body: '#b8d8c9', awning: '#00885a' } },
  { id: 'maple-311', kind: 'shop', name: 'Red Rocket Records', number: 311, street: 'Maple Avenue', position: [13, 0, 45], rotation: Math.PI, colors: { body: '#d8c9b8', awning: '#c0392b' } },
  { id: 'maple-315', kind: 'shop', name: 'Blue Harbor Books', number: 315, street: 'Maple Avenue', position: [23, 0, 45], rotation: Math.PI, colors: { body: '#b8c9d8', awning: '#2d6cdf' } },
]

export function addressOf(b: BuildingEntry): string {
  return `${b.number} ${b.street}`
}

export function getBuilding(id: string): BuildingEntry | undefined {
  return BUILDINGS.find((b) => b.id === id)
}

/** Local-space door offset (x, z) for each building kind; buildings face +z. */
function doorLocal(b: BuildingEntry): [number, number] {
  switch (b.kind) {
    case 'house':
      return [0, 2.5]
    case 'restaurant':
      return [0, 5.05]
    case 'shop':
      return [0, 4.05]
    case 'office':
      return [0, (b.size?.depth ?? 10) / 2]
    case 'gasstation':
      // the convenience shop's door, at the back of the pad
      return [0, -2.3]
  }
}

/** World-space door position for a building. */
export function doorWorld(b: BuildingEntry): { x: number; z: number } {
  const [dx, dz] = doorLocal(b)
  const c = Math.cos(b.rotation)
  const s = Math.sin(b.rotation)
  return {
    x: b.position[0] + dx * c + dz * s,
    z: b.position[2] - dx * s + dz * c,
  }
}
