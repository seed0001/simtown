import type { InteriorDef } from '../city/interiors'
import { Furniture } from './Furniture'
import { Occupants } from './People'
import { SignPlate } from './TextLabel'

const WALL_H = 3.1
const DOOR_W = 1.8

/** Renders a building interior from its InteriorDef. Door gap is centered on the +z wall. */
export default function Interior({ id, def }: { id: string; def: InteriorDef }) {
  const { width: w, depth: d } = def
  const segW = (w - DOOR_W) / 2
  const segX = DOOR_W / 2 + segW / 2

  return (
    <group>
      <color attach="background" args={['#0b0b12']} />
      <ambientLight intensity={0.75} />
      <pointLight position={[-w / 4, 2.7, 0]} intensity={30} distance={22} decay={1.6} castShadow />
      <pointLight position={[w / 4, 2.7, 0]} intensity={30} distance={22} decay={1.6} />

      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={def.floorColor} />
      </mesh>
      {/* ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[0, WALL_H, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#efe9dc" />
      </mesh>

      {/* back wall */}
      <mesh position={[0, WALL_H / 2, -d / 2]} receiveShadow>
        <boxGeometry args={[w, WALL_H, 0.2]} />
        <meshStandardMaterial color={def.wallColor} />
      </mesh>
      {/* side walls */}
      {[-w / 2, w / 2].map((x) => (
        <mesh key={x} position={[x, WALL_H / 2, 0]} receiveShadow>
          <boxGeometry args={[0.2, WALL_H, d]} />
          <meshStandardMaterial color={def.wallColor} />
        </mesh>
      ))}
      {/* front wall, split around the door gap */}
      {[-segX, segX].map((x) => (
        <mesh key={x} position={[x, WALL_H / 2, d / 2]} receiveShadow>
          <boxGeometry args={[segW, WALL_H, 0.2]} />
          <meshStandardMaterial color={def.wallColor} />
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
          <meshStandardMaterial color="#6b4a2f" />
        </mesh>
      ))}

      <SignPlate
        text="EXIT"
        position={[0, 2.55, d / 2 - 0.18]}
        rotation={Math.PI}
        width={0.9}
        height={0.35}
        bg="#1e6b3a"
      />

      {def.items.map((item, i) => (
        <Furniture key={i} item={item} />
      ))}

      <Occupants buildingId={id} def={def} />
    </group>
  )
}
