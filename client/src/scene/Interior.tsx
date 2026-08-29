import type { InteriorDef, InteriorPortal } from '../city/interiors'
import { Furniture } from './Furniture'
import { GRAIN_BUMP, grainTexture } from './grain'
import { Occupants } from './People'
import { SignPlate } from './TextLabel'

const WALL_H = 3.1
const DOOR_W = 1.8
const PORTAL_W = 1.6

/** A classroom door on a side wall, with the grade name above it. */
function Portal({ p, w }: { p: InteriorPortal; w: number }) {
  const sign = p.wall === 'left' ? -1 : 1
  const x = (sign * w) / 2
  return (
    <group position={[x, 0, p.z]}>
      {/* recessed frame */}
      <mesh position={[-sign * 0.06, 1.15, 0]}>
        <boxGeometry args={[0.14, 2.3, PORTAL_W + 0.25]} />
        <meshStandardMaterial color="#d8d2c4" />
      </mesh>
      {/* the door leaf */}
      <mesh position={[-sign * 0.14, 1.05, 0]}>
        <boxGeometry args={[0.1, 2.1, PORTAL_W]} />
        <meshStandardMaterial color="#5a4636" />
      </mesh>
      <mesh position={[-sign * 0.22, 1.05, sign * 0.5]}>
        <boxGeometry args={[0.06, 0.12, 0.12]} />
        <meshStandardMaterial color="#e8d68c" metalness={0.4} />
      </mesh>
      <SignPlate
        text={p.label.split(' · ')[0]}
        position={[-sign * 0.2, 2.5, 0]}
        rotation={(-sign * Math.PI) / 2}
        width={1.5}
        height={0.42}
        bg="#2f4a2f"
      />
    </group>
  )
}

/** Renders a building interior from its InteriorDef. Door gap is centered on the +z wall. */
export default function Interior({ id, def }: { id: string; def: InteriorDef }) {
  const { width: w, depth: d } = def
  const segW = (w - DOOR_W) / 2
  const segX = DOOR_W / 2 + segW / 2

  // one ceiling light per ~11m of length so long halls aren't black at the ends
  const rows = Math.max(1, Math.round(d / 11))
  const lightXs = w > 9 ? [-w / 4, w / 4] : [0]
  const lights: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    const z = -d / 2 + (d * (r + 0.5)) / rows
    for (const lx of lightXs) lights.push([lx, z])
  }

  return (
    <>
    {/* scene-root attach; inside the group it would bind to the group and do nothing */}
    <color attach="background" args={['#101010']} />
    <group>
      <ambientLight intensity={0.75} />
      {lights.map(([lx, lz], i) => (
        <pointLight
          key={i}
          position={[lx, 2.7, lz]}
          intensity={22}
          distance={20}
          decay={1.6}
          castShadow={i < 2}
        />
      ))}

      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={def.floorColor} bumpMap={grainTexture(10)} bumpScale={GRAIN_BUMP} />
      </mesh>
      {/* ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[0, WALL_H, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#f2ede0" />
      </mesh>

      {/* back wall */}
      <mesh position={[0, WALL_H / 2, -d / 2]} receiveShadow>
        <boxGeometry args={[w, WALL_H, 0.2]} />
        <meshStandardMaterial color={def.wallColor} bumpMap={grainTexture(8, 3)} bumpScale={GRAIN_BUMP} />
      </mesh>
      {/* side walls */}
      {[-w / 2, w / 2].map((x) => (
        <mesh key={x} position={[x, WALL_H / 2, 0]} receiveShadow>
          <boxGeometry args={[0.2, WALL_H, d]} />
          <meshStandardMaterial color={def.wallColor} bumpMap={grainTexture(8, 3)} bumpScale={GRAIN_BUMP} />
        </mesh>
      ))}
      {/* front wall, split around the door gap */}
      {[-segX, segX].map((x) => (
        <mesh key={x} position={[x, WALL_H / 2, d / 2]} receiveShadow>
          <boxGeometry args={[segW, WALL_H, 0.2]} />
          <meshStandardMaterial color={def.wallColor} bumpMap={grainTexture(8, 3)} bumpScale={GRAIN_BUMP} />
        </mesh>
      ))}
      {/* lintel above the door */}
      <mesh position={[0, WALL_H - 0.2, d / 2]}>
        <boxGeometry args={[DOOR_W, 0.4, 0.2]} />
        <meshStandardMaterial color={def.wallColor} />
      </mesh>
      {/* door frame accents */}
      {[-DOOR_W / 2, DOOR_W / 2].map((x) => (
        <mesh key={x} position={[x, 1.35, d / 2]}>
          <boxGeometry args={[0.1, 2.7, 0.26]} />
          <meshStandardMaterial color="#3a2e22" />
        </mesh>
      ))}

      <SignPlate
        text="EXIT"
        position={[0, 2.55, d / 2 - 0.18]}
        rotation={Math.PI}
        width={0.9}
        height={0.35}
        bg="#7a1f1f"
      />

      {def.items.map((item, i) => (
        <Furniture key={i} item={item} />
      ))}

      {def.portals?.map((p) => (
        <Portal key={p.toId} p={p} w={w} />
      ))}

      <Occupants buildingId={id} def={def} />
    </group>
    </>
  )
}
