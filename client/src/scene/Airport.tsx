import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  APRON,
  HANGAR,
  HELIPAD,
  RUNWAY,
  TAXIWAY,
  TOWER,
  WINDSOCK,
} from '../city/airport'
import { GRAIN_BUMP, grainTexture } from './grain'
import { SignPlate } from './TextLabel'

// Simtown Municipal. Static scenery only — the aircraft live in Flights.tsx.
// Pavement is drawn as flat planes stacked just above the ground, in the same
// way RoadNetwork lays down the streets.

const ASPHALT = '#33363d'
const CONCRETE = '#9c9488'
const PAINT = '#f2efe6'

function Pavement({
  x,
  z,
  width,
  depth,
  color,
  y = 0.015,
}: {
  x: number
  z: number
  width: number
  depth: number
  color: string
  y?: number
}) {
  return (
    <mesh position={[x, y, z]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color={color}
        bumpMap={grainTexture(Math.max(1, Math.round(width / 4)), Math.max(1, Math.round(depth / 4)))}
        bumpScale={GRAIN_BUMP}
      />
    </mesh>
  )
}

function Runway() {
  const length = RUNWAY.zEnd - RUNWAY.zStart
  const midZ = (RUNWAY.zStart + RUNWAY.zEnd) / 2

  // dashed centreline
  const dashes: number[] = []
  for (let z = RUNWAY.zStart + 8; z <= RUNWAY.zEnd - 8; z += 10) dashes.push(z)

  // threshold bars at each end
  const bars = [-3.6, -2.2, -0.8, 0.8, 2.2, 3.6]

  return (
    <group>
      <Pavement x={RUNWAY.x} z={midZ} width={RUNWAY.width} depth={length} color={ASPHALT} />

      {dashes.map((z) => (
        <mesh key={z} position={[RUNWAY.x, 0.03, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.5, 4]} />
          <meshStandardMaterial color={PAINT} />
        </mesh>
      ))}

      {[RUNWAY.zStart + 5, RUNWAY.zEnd - 5].map((z) =>
        bars.map((offset) => (
          <mesh key={`${z}-${offset}`} position={[RUNWAY.x + offset, 0.03, z]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[0.7, 7]} />
            <meshStandardMaterial color={PAINT} />
          </mesh>
        )),
      )}

      {/* edge lights */}
      {Array.from({ length: Math.floor(length / 12) + 1 }, (_, i) => RUNWAY.zStart + i * 12).map((z) =>
        [-1, 1].map((side) => (
          <mesh key={`${z}-${side}`} position={[RUNWAY.x + side * (RUNWAY.width / 2 + 0.7), 0.16, z]}>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="#f4f4f4" emissive="#eaeaea" emissiveIntensity={0.7} />
          </mesh>
        )),
      )}
    </group>
  )
}

function Helipad() {
  const ring = 20
  return (
    <group position={[HELIPAD.x, 0.032, HELIPAD.z]} rotation-x={-Math.PI / 2}>
      <mesh>
        <circleGeometry args={[HELIPAD.radius, ring]} />
        <meshStandardMaterial color="#484848" />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[HELIPAD.radius - 0.55, HELIPAD.radius - 0.15, ring]} />
        <meshStandardMaterial color={PAINT} />
      </mesh>
      {/* the H */}
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 0, 0.003]}>
          <planeGeometry args={[0.55, 3.2]} />
          <meshStandardMaterial color={PAINT} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[2.0, 0.55]} />
        <meshStandardMaterial color={PAINT} />
      </mesh>
    </group>
  )
}

function Hangar() {
  const w = 20
  const d = 14
  const h = 6.5
  return (
    <group position={[HANGAR.x, 0, HANGAR.z]}>
      {/* back and sides */}
      <mesh position={[0, h / 2, -d / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.4]} />
        <meshStandardMaterial color="#7d8790" bumpMap={grainTexture(6)} bumpScale={GRAIN_BUMP} />
      </mesh>
      {[-w / 2, w / 2].map((x) => (
        <mesh key={x} position={[x, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, h, d]} />
          <meshStandardMaterial color="#7d8790" bumpMap={grainTexture(6)} bumpScale={GRAIN_BUMP} />
        </mesh>
      ))}
      {/* Barrel roof. Rotated about X so the axis runs front-to-back over the
          depth; about Z it would lie across the opening and come out short of
          the walls. theta starts at -90° to keep the upper half, and the Y
          scale flattens a semicircle into a shallower arch. */}
      <mesh position={[0, h, 0]} rotation-x={-Math.PI / 2} scale={[1, 1, 0.42]} castShadow>
        <cylinderGeometry args={[w / 2, w / 2, d, 18, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#9aa5ac" flatShading />
      </mesh>
      {/* opening faces the apron (+z): a lintel above, doors parked either side */}
      <mesh position={[0, h - 0.6, d / 2]} castShadow>
        <boxGeometry args={[w, 1.2, 0.4]} />
        <meshStandardMaterial color="#5a646c" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 2.2), (h - 1.2) / 2, d / 2]} castShadow>
          <boxGeometry args={[4.2, h - 1.2, 0.35]} />
          <meshStandardMaterial color="#454d54" />
        </mesh>
      ))}
      <SignPlate
        text="HANGAR 1"
        position={[0, h + 0.6, d / 2 + 0.1]}
        width={5}
        height={0.9}
        bg="#2c2c2c"
      />
    </group>
  )
}

function ControlTower() {
  return (
    <group position={[TOWER.x, 0, TOWER.z]}>
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 10, 4]} />
        <meshStandardMaterial color="#c7cdd2" bumpMap={grainTexture(3, 7)} bumpScale={GRAIN_BUMP} />
      </mesh>
      {/* glazed cab, slightly proud of the shaft */}
      <mesh position={[0, 11, 0]} castShadow>
        <boxGeometry args={[5.4, 2.4, 5.4]} />
        <meshStandardMaterial color="#1f2a33" metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh position={[0, 12.35, 0]} castShadow>
        <boxGeometry args={[5.8, 0.4, 5.8]} />
        <meshStandardMaterial color="#a8b0b6" />
      </mesh>
      {/* rotating beacon */}
      <mesh position={[0, 12.85, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color="#ff5040" emissive="#ff3020" emissiveIntensity={1.3} />
      </mesh>
    </group>
  )
}

function Windsock() {
  const sock = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!sock.current) return
    // lazy swing, as if the breeze keeps shifting
    sock.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.6 + 0.4
  })
  return (
    <group position={[WINDSOCK.x, 0, WINDSOCK.z]}>
      <mesh position={[0, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4.8, 8]} />
        <meshStandardMaterial color="#3c3c3c" />
      </mesh>
      <group ref={sock} position={[0, 4.6, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0, 0.6 + i * 0.85]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.44 - i * 0.1, 0.52 - i * 0.1, 0.85, 10, 1, true]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#e8722c' : '#f2ede0'}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Perimeter posts along the town side of the field, running north from the
 * terminal. Stops short of the terminal itself, which is the way in.
 */
function Fence() {
  const zFrom = -62
  const zTo = -22
  const posts: number[] = []
  for (let z = zFrom; z <= zTo; z += 6) posts.push(z)
  const midZ = (zFrom + zTo) / 2
  const span = zTo - zFrom

  return (
    <group>
      {posts.map((z) => (
        <mesh key={z} position={[68, 0.9, z]} castShadow>
          <boxGeometry args={[0.12, 1.8, 0.12]} />
          <meshStandardMaterial color="#7a828a" />
        </mesh>
      ))}
      {[1.7, 0.95].map((y) => (
        <mesh key={y} position={[68, y, midZ]}>
          <boxGeometry args={[0.06, 0.08, span]} />
          <meshStandardMaterial color="#7a828a" />
        </mesh>
      ))}
    </group>
  )
}

export default function Airport() {
  const apronDepth = APRON.depth
  const taxiLength = TAXIWAY.xEnd - TAXIWAY.xStart
  const taxiMid = (TAXIWAY.xStart + TAXIWAY.xEnd) / 2

  return (
    <group>
      {/* no ground plane of its own — the town's grass runs out here, and an
          overlay large enough to cover the field showed a visible seam */}
      <Runway />
      <Pavement x={taxiMid} z={TAXIWAY.z} width={taxiLength} depth={TAXIWAY.width} color={ASPHALT} />
      <Pavement x={APRON.x} z={APRON.z} width={APRON.width} depth={apronDepth} color={CONCRETE} />
      <Helipad />

      {/* stand markings */}
      {[
        [94, -20],
        [84, -14],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.03, z]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.6, 2.9, 18]} />
          <meshStandardMaterial color="#e8c93a" />
        </mesh>
      ))}

      <Hangar />
      <ControlTower />
      <Windsock />
      <Fence />

      {/* forecourt, so Main Street arrives at the terminal instead of stopping in the grass */}
      <Pavement x={73} z={-6.1} width={26} depth={5.4} color={CONCRETE} y={0.018} />

      {/* Sign rides above the canopy roof edge rather than on the wall: at an
          angle the canopy posts cut straight across a wall-mounted one. */}
      <SignPlate
        text="SIMTOWN MUNICIPAL"
        position={[72, 6.3, -5.7]}
        width={9.5}
        height={1.05}
        bg="#222222"
      />
    </group>
  )
}
