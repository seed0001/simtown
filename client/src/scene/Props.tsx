import { GRAIN_BUMP, grainTexture } from './grain'

export function Tree({
  position,
  scale = 1,
  foliage = '#4a8f3c',
}: {
  position: [number, number, number]
  scale?: number
  foliage?: string
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 1.6, 7]} />
        <meshStandardMaterial color="#5b3a22" />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[1.25, 10, 8]} />
        <meshStandardMaterial color={foliage} flatShading />
      </mesh>
      <mesh position={[0.3, 3, 0.2]} castShadow>
        <sphereGeometry args={[0.8, 9, 7]} />
        <meshStandardMaterial color={foliage} flatShading />
      </mesh>
    </group>
  )
}

export function StreetLight({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 5, 8]} />
        <meshStandardMaterial color="#2e3327" />
      </mesh>
      {/* arm reaching over the road (+z) */}
      <mesh position={[0, 4.95, 0.7]}>
        <boxGeometry args={[0.09, 0.09, 1.6]} />
        <meshStandardMaterial color="#2e3327" />
      </mesh>
      <mesh position={[0, 4.85, 1.45]}>
        <boxGeometry args={[0.28, 0.14, 0.55]} />
        <meshStandardMaterial color="#ffe4a0" emissive="#ffcf6b" emissiveIntensity={0.75} />
      </mesh>
    </group>
  )
}

const ROAD_AXES = [-36, 0, 36]
const ROAD_HALF = 4

/** Roads on a 3x3 grid: horizontal + vertical strips with dashed center lines. */
export function RoadNetwork() {
  const dashes: { pos: [number, number, number]; horizontal: boolean }[] = []
  for (const axis of ROAD_AXES) {
    for (let d = -72; d <= 72; d += 6) {
      // skip dashes inside intersections
      if (ROAD_AXES.some((cross) => Math.abs(d - cross) < 6)) continue
      dashes.push({ pos: [d, 0.03, axis], horizontal: true })
      dashes.push({ pos: [axis, 0.03, d], horizontal: false })
    }
  }
  return (
    <group>
      {ROAD_AXES.map((axis) => (
        <group key={axis}>
          <mesh position={[0, 0.01, axis]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[150, ROAD_HALF * 2]} />
            <meshStandardMaterial color="#33363d" bumpMap={grainTexture(40, 2)} bumpScale={GRAIN_BUMP} />
          </mesh>
          <mesh position={[axis, 0.01, 0]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[ROAD_HALF * 2, 150]} />
            <meshStandardMaterial color="#33363d" bumpMap={grainTexture(2, 40)} bumpScale={GRAIN_BUMP} />
          </mesh>
          {/* sidewalks along horizontal + vertical roads */}
          {[ROAD_HALF + 0.9, -ROAD_HALF - 0.9].map((off) => (
            <group key={off}>
              <mesh position={[0, 0.02, axis + off]} rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[150, 1.8]} />
                <meshStandardMaterial color="#c9c2ac" bumpMap={grainTexture(40, 1)} bumpScale={GRAIN_BUMP} />
              </mesh>
              <mesh position={[axis + off, 0.02, 0]} rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[1.8, 150]} />
                <meshStandardMaterial color="#c9c2ac" bumpMap={grainTexture(1, 40)} bumpScale={GRAIN_BUMP} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {dashes.map((d, i) => (
        <mesh key={i} position={d.pos} rotation-x={-Math.PI / 2}>
          <planeGeometry args={d.horizontal ? [1.8, 0.28] : [0.28, 1.8]} />
          <meshStandardMaterial color="#e8c93a" />
        </mesh>
      ))}
    </group>
  )
}
