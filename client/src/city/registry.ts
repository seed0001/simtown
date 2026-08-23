// Single source of truth for every building in SimTown.
// Each building has a stable id, a street address, and a door position.
// To edit a building, find it here by address; its interior map lives in
// interiors.ts under the same id.

export type BuildingKind = 'house' | 'restaurant' | 'gasstation' | 'shop' | 'office' | 'airport'

export type RoofStyle = 'pyramid' | 'gabled' | 'flat' | 'shed'

export interface BuildingEntry {
  id: string
  kind: BuildingKind
  name: string
  number: number
  street: string
  position: [number, number, number]
  rotation: number // radians around Y; buildings face +z in local space
  colors?: { body?: string; roof?: string; awning?: string; accent?: string }
  size?: { width?: number; depth?: number; height?: number }
  // house-only: roof shape and small attached details
  roofStyle?: RoofStyle
  features?: { porch?: boolean; dormer?: boolean; garage?: boolean; secondChimney?: boolean }
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
  { id: 'main-100', kind: 'house', name: 'Larkspur House', number: 100, street: 'Main Street', position: [-48, 0, -12], rotation: 0, colors: { body: '#d6d6d6', roof: '#5a5a5a' }, roofStyle: 'pyramid', features: { porch: true } },
  { id: 'main-102', kind: 'house', name: 'Cedar Cottage', number: 102, street: 'Main Street', position: [-25, 0, -12], rotation: 0, colors: { body: '#cfcfcf', roof: '#646464' }, size: { width: 6.4, height: 3.4 }, roofStyle: 'gabled', features: { garage: true } },
  { id: 'main-106', kind: 'house', name: 'Rosewood House', number: 106, street: 'Main Street', position: [-14, 0, -12], rotation: 0, colors: { body: '#dcdcdc', roof: '#4e4e4e' }, size: { width: 5.6, depth: 4.6, height: 3.6 }, roofStyle: 'flat', features: { dormer: true } },
  { id: 'main-112', kind: 'restaurant', name: 'Bluebird Diner', number: 112, street: 'Main Street', position: [16, 0, -12], rotation: 0 },
  { id: 'main-118', kind: 'office', name: 'Eastview Offices', number: 118, street: 'Main Street', position: [48, 0, -14], rotation: 0, colors: { body: '#9e9e9e' }, size: { height: 17 } },
  // the airport terminal sits at the east end of Main Street; the airfield itself is scenery (city/airport.ts)
  { id: 'main-130', kind: 'airport', name: 'Simtown Municipal Airport', number: 130, street: 'Main Street', position: [72, 0, -13], rotation: 0, colors: { body: '#dadada', roof: '#5e5e5e' }, size: { width: 18, depth: 11, height: 5.4 } },
  // ---------- Main Street, south side ----------
  { id: 'main-99', kind: 'house', name: 'Aspen Cottage', number: 99, street: 'Main Street', position: [-48, 0, 12], rotation: Math.PI, colors: { body: '#c8c8c8', roof: '#606060' }, size: { depth: 5.4, height: 3 }, roofStyle: 'shed', features: { porch: true } },
  { id: 'main-101', kind: 'house', name: 'Hazel House', number: 101, street: 'Main Street', position: [-25, 0, 12], rotation: Math.PI, colors: { body: '#e0e0e0', roof: '#565656' }, size: { width: 6.6, depth: 5.5, height: 3.3 }, roofStyle: 'gabled' },
  { id: 'main-105', kind: 'house', name: 'Bluebell Cottage', number: 105, street: 'Main Street', position: [-14, 0, 12], rotation: Math.PI, colors: { body: '#d2d2d2', roof: '#525252' }, size: { width: 5.8, depth: 4.8, height: 3.5 }, roofStyle: 'pyramid', features: { dormer: true, secondChimney: true } },
  { id: 'main-115', kind: 'gasstation', name: 'Gas & Go', number: 115, street: 'Main Street', position: [17, 0, 13], rotation: Math.PI },
  // ---------- Oak Avenue, south side ----------
  { id: 'oak-203', kind: 'house', name: 'Juniper House', number: 203, street: 'Oak Avenue', position: [-25, 0, -25], rotation: Math.PI, colors: { body: '#e4e4e4', roof: '#606060' }, size: { width: 6.2 }, roofStyle: 'flat', features: { garage: true } },
  { id: 'oak-207', kind: 'house', name: 'Willow House', number: 207, street: 'Oak Avenue', position: [-14, 0, -25], rotation: Math.PI, colors: { body: '#cccccc', roof: '#585858' }, size: { width: 5.6, height: 2.9 }, roofStyle: 'shed', features: { porch: true } },
  // ---------- Oak Avenue, north side (downtown) ----------
  { id: 'oak-202', kind: 'office', name: 'Meridian Offices', number: 202, street: 'Oak Avenue', position: [-24, 0, -48], rotation: 0, colors: { body: '#a2a2a2' }, size: { height: 15 } },
  { id: 'oak-206', kind: 'office', name: 'Sandstone Tower', number: 206, street: 'Oak Avenue', position: [-11, 0, -48], rotation: 0, colors: { body: '#aaaaaa' }, size: { height: 21 } },
  { id: 'oak-210', kind: 'office', name: 'Northgate Tower', number: 210, street: 'Oak Avenue', position: [12, 0, -48], rotation: 0, colors: { body: '#8e8e8e' }, size: { height: 18 } },
  { id: 'oak-214', kind: 'office', name: 'Lavender Plaza', number: 214, street: 'Oak Avenue', position: [25, 0, -48], rotation: 0, colors: { body: '#b4b4b4' }, size: { height: 13, width: 11 } },
  // ---------- Maple Avenue, north side ----------
  { id: 'maple-302', kind: 'house', name: 'Honey House', number: 302, street: 'Maple Avenue', position: [-25, 0, 25], rotation: 0, colors: { body: '#d8d8d8', roof: '#5c5c5c' }, size: { depth: 4.6, height: 3.6 }, roofStyle: 'pyramid', features: { garage: true } },
  { id: 'maple-306', kind: 'house', name: 'Fern Cottage', number: 306, street: 'Maple Avenue', position: [-14, 0, 25], rotation: 0, colors: { body: '#dedede', roof: '#626262' }, size: { width: 5.8, depth: 5.2, height: 3.1 }, roofStyle: 'gabled', features: { dormer: true } },
  // ---------- Maple Avenue, south side (shops) ----------
  { id: 'maple-301', kind: 'shop', name: 'Violet Boutique', number: 301, street: 'Maple Avenue', position: [-20, 0, 45], rotation: Math.PI, colors: { body: '#c6c6c6', awning: '#3e3e3e' } },
  { id: 'maple-305', kind: 'shop', name: 'Green Grocer', number: 305, street: 'Maple Avenue', position: [-10, 0, 45], rotation: Math.PI, colors: { body: '#cccccc', awning: '#484848' } },
  { id: 'maple-311', kind: 'shop', name: 'Red Rocket Records', number: 311, street: 'Maple Avenue', position: [13, 0, 45], rotation: Math.PI, colors: { body: '#d0d0d0', awning: '#343434' } },
  { id: 'maple-315', kind: 'shop', name: 'Blue Harbor Books', number: 315, street: 'Maple Avenue', position: [23, 0, 45], rotation: Math.PI, colors: { body: '#c2c2c2', awning: '#525252' } },
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
      return [0, (b.size?.depth ?? 5) / 2]
    case 'restaurant':
      return [0, 5.05]
    case 'shop':
      return [0, 4.05]
    case 'office':
    case 'airport':
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
