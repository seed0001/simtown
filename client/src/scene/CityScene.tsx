import { BUILDINGS, STREETS, doorWorld, type BuildingEntry } from '../city/registry'
import Airport from './Airport'
import { GasStation, House, OfficeBuilding, Restaurant, Shop, Terminal } from './Buildings'
import Flights from './Flights'
import { GRAIN_BUMP, grainTexture } from './grain'
import { StreetPeople } from './People'
import { RoadNetwork, StreetLight, Tree } from './Props'
import { AddressPlate, StreetSignPost } from './TextLabel'

const TREES: [number, number, number][] = [
  [-7, 0, -7], [7, 0, 28], [-7, 0, 28], [28, 0, -7],
  [-30, 0, -18], [-19, 0, -18], [-30, 0, 18], [-19, 0, 18],
  [-44, 0, 26], [-52, 0, -26], [-55, 0, 30], [44, 0, 8],
  [46, 0, 28], [54, 0, 18], [30, 0, 30], [50, 0, -30],
  [-44, 0, 48], [40, 0, 48], [8, 0, -18], [-7, 0, -28],
]

const STREETLIGHTS: { pos: [number, number, number]; rot: number }[] = [
  { pos: [-20, 0, -5.6], rot: 0 },
  { pos: [-20, 0, 5.6], rot: Math.PI },
  { pos: [20, 0, -5.6], rot: 0 },
  { pos: [20, 0, 5.6], rot: Math.PI },
  { pos: [-52, 0, -5.6], rot: 0 },
  { pos: [52, 0, 5.6], rot: Math.PI },
  { pos: [-5.6, 0, -20], rot: Math.PI / 2 },
  { pos: [5.6, 0, 20], rot: -Math.PI / 2 },
  { pos: [-5.6, 0, 46], rot: Math.PI / 2 },
  { pos: [5.6, 0, -46], rot: -Math.PI / 2 },
]

function Building({ b }: { b: BuildingEntry }) {
  switch (b.kind) {
    case 'house':
      return (
        <House
          position={b.position}
          rotation={b.rotation}
          bodyColor={b.colors?.body}
          roofColor={b.colors?.roof}
        />
      )
    case 'restaurant':
      return <Restaurant position={b.position} rotation={b.rotation} />
    case 'gasstation':
      return <GasStation position={b.position} rotation={b.rotation} />
    case 'shop':
      return (
        <Shop
          position={b.position}
          rotation={b.rotation}
          color={b.colors?.body}
          awningColor={b.colors?.awning}
        />
      )
    case 'office':
      return (
        <OfficeBuilding
          position={b.position}
          rotation={b.rotation}
          width={b.size?.width}
          depth={b.size?.depth}
          height={b.size?.height}
          color={b.colors?.body}
        />
      )
    case 'airport':
      return (
        <Terminal
          position={b.position}
          rotation={b.rotation}
          width={b.size?.width}
          depth={b.size?.depth}
          height={b.size?.height}
          color={b.colors?.body}
          roofColor={b.colors?.roof}
        />
      )
  }
}

// plate height above each door, per building kind
const PLATE_Y: Record<BuildingEntry['kind'], number> = {
  house: 2.5,
  restaurant: 2.9,
  gasstation: 3.1,
  shop: 2.7,
  office: 3.2,
  airport: 3.4,
}

export default function CityScene() {
  return (
    <>
      {/* environment: a paper-white sky, gray haze, colorless light. Attached
          at the scene root — inside the group they'd attach to the group and
          silently do nothing. */}
      <color attach="background" args={['#e6e6e6']} />
      {/* fog reaches past the airfield now, so the runway is visible from town */}
      <fog attach="fog" args={['#d8d8d8', 70, 300]} />
    <group>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#f4f4f4', '#8a8a8a', 0.35]} />
      {/* the shadow frustum has to cover the airport too; the bigger map keeps
          the town's shadows finer than they were before it was widened */}
      <directionalLight
        position={[60, 80, 30]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-camera-far={420}
        shadow-bias={-0.0004}
      />

      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#a6a6a6" bumpMap={grainTexture(64)} bumpScale={GRAIN_BUMP} />
      </mesh>

      <RoadNetwork />

      <Airport />
      <Flights />

      <StreetPeople />

      {BUILDINGS.map((b) => {
        const door = doorWorld(b)
        return (
          <group key={b.id}>
            <Building b={b} />
            <AddressPlate
              number={b.number}
              position={[door.x, PLATE_Y[b.kind], door.z]}
              rotation={b.rotation}
            />
          </group>
        )
      })}

      {/* street name signs at every intersection */}
      {STREETS.ew.map((ew) =>
        STREETS.ns.map((ns) => (
          <StreetSignPost
            key={`${ew.name}-${ns.name}`}
            position={[ns.x + 5.4, 0, ew.z + 5.4]}
            ewName={ew.name}
            nsName={ns.name}
          />
        )),
      )}

      {TREES.map((pos, i) => (
        <Tree
          key={i}
          position={pos}
          scale={0.85 + ((i * 7) % 5) * 0.12}
          foliage={i % 3 === 0 ? '#6a6a6a' : i % 3 === 1 ? '#565656' : '#7a7a7a'}
        />
      ))}

      {STREETLIGHTS.map((s, i) => (
        <StreetLight key={i} position={s.pos} rotation={s.rot} />
      ))}
    </group>
    </>
  )
}
