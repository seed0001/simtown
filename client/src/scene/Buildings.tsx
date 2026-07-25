// Low-poly procedural buildings. All buildings sit on y=0 and face +z in local
// space — use the rotation prop to orient them toward a road.

type BuildingProps = {
  position: [number, number, number]
  rotation?: number
}

export function House({
  position,
  rotation = 0,
  bodyColor = '#e8d8b0',
  roofColor = '#8c4a3c',
}: BuildingProps & { bodyColor?: string; roofColor?: string }) {
  return (
    <group position={position} rotation-y={rotation}>
      {/* body */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 3.2, 5]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* pyramid roof */}
      <mesh position={[0, 4.3, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[4.4, 2.2, 4]} />
        <meshStandardMaterial color={roofColor} flatShading />
      </mesh>
      {/* chimney */}
      <mesh position={[1.6, 4.8, -1]} castShadow>
        <boxGeometry args={[0.7, 1.6, 0.7]} />
        <meshStandardMaterial color="#7a6a5a" />
      </mesh>
      {/* door */}
      <mesh position={[0, 1, 2.51]}>
        <boxGeometry args={[1.1, 2, 0.08]} />
        <meshStandardMaterial color="#5a3825" />
      </mesh>
      {/* windows */}
      {[-1.8, 1.8].map((x) => (
        <mesh key={x} position={[x, 1.9, 2.51]}>
          <boxGeometry args={[1.2, 1, 0.08]} />
          <meshStandardMaterial color="#bfe3f2" emissive="#9cc8dd" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  )
}

export function Restaurant({ position, rotation = 0 }: BuildingProps) {
  return (
    <group position={position} rotation-y={rotation}>
      {/* body */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[14, 4, 10]} />
        <meshStandardMaterial color="#efe3cd" />
      </mesh>
      {/* parapet */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <boxGeometry args={[14.4, 0.4, 10.4]} />
        <meshStandardMaterial color="#b3564d" />
      </mesh>
      {/* striped awning */}
      {[-5, -3, -1, 1, 3, 5].map((x, i) => (
        <mesh key={x} position={[x, 3.1, 5.8]} rotation-x={0.35}>
          <boxGeometry args={[2, 0.12, 1.8]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#c0392b' : '#f5f0e6'} />
        </mesh>
      ))}
      {/* storefront windows */}
      {[-4.2, 4.2].map((x) => (
        <mesh key={x} position={[x, 1.9, 5.05]}>
          <boxGeometry args={[4, 1.8, 0.08]} />
          <meshStandardMaterial color="#cdeaf5" emissive="#a8d4e8" emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* door */}
      <mesh position={[0, 1.2, 5.05]}>
        <boxGeometry args={[1.5, 2.4, 0.08]} />
        <meshStandardMaterial color="#7a3b2e" />
      </mesh>
      {/* roof sign: red panel with white bar (reads as "DINER") */}
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, 4.9, 3.5]}>
          <boxGeometry args={[0.25, 1.2, 0.25]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      <mesh position={[0, 5.9, 3.5]} castShadow>
        <boxGeometry args={[6.5, 1.7, 0.4]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[0, 5.9, 3.72]}>
        <boxGeometry args={[5.4, 0.8, 0.06]} />
        <meshStandardMaterial color="#fdf6e3" emissive="#fdf6e3" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

export function GasStation({ position, rotation = 0 }: BuildingProps) {
  return (
    <group position={position} rotation-y={rotation}>
      {/* concrete pad */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[18, 0.1, 14]} />
        <meshStandardMaterial color="#9a9aa0" />
      </mesh>
      {/* canopy */}
      <mesh position={[0, 5, 1.5]} castShadow>
        <boxGeometry args={[12, 0.5, 8]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
      {/* red fascia stripe on canopy front */}
      <mesh position={[0, 5, 5.55]}>
        <boxGeometry args={[12, 0.5, 0.15]} />
        <meshStandardMaterial color="#d63031" />
      </mesh>
      {/* canopy pillars */}
      {[
        [-4.5, -1.5],
        [4.5, -1.5],
        [-4.5, 4.5],
        [4.5, 4.5],
      ].map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 2.5, z]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 5, 10]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>
      ))}
      {/* fuel pumps */}
      {[-2.2, 2.2].map((x) => (
        <group key={x} position={[x, 0, 1.5]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.9, 1.3, 0.6]} />
            <meshStandardMaterial color="#e8e8e8" />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[0.92, 0.35, 0.62]} />
            <meshStandardMaterial color="#d63031" />
          </mesh>
        </group>
      ))}
      {/* shop */}
      <mesh position={[0, 1.75, -4.8]} castShadow receiveShadow>
        <boxGeometry args={[9, 3.5, 5]} />
        <meshStandardMaterial color="#dcdcdc" />
      </mesh>
      <mesh position={[0, 1.6, -2.26]}>
        <boxGeometry args={[6, 1.8, 0.08]} />
        <meshStandardMaterial color="#bfe3f2" emissive="#9cc8dd" emissiveIntensity={0.35} />
      </mesh>
      {/* tall road sign */}
      <group position={[7.5, 0, 5.5]}>
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 6, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <mesh position={[0, 6.6, 0]} castShadow>
          <boxGeometry args={[2.6, 1.8, 0.3]} />
          <meshStandardMaterial color="#d63031" />
        </mesh>
        <mesh position={[0, 6.6, 0.18]}>
          <boxGeometry args={[2, 0.7, 0.06]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  )
}

export function Shop({
  position,
  rotation = 0,
  color = '#c9b8d8',
  awningColor = '#6c5ce7',
}: BuildingProps & { color?: string; awningColor?: string }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 3.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 3.7, 0]} castShadow>
        <boxGeometry args={[8.4, 0.4, 8.4]} />
        <meshStandardMaterial color="#6b6b70" />
      </mesh>
      <mesh position={[0, 3, 4.6]} rotation-x={0.35}>
        <boxGeometry args={[7, 0.12, 1.5]} />
        <meshStandardMaterial color={awningColor} />
      </mesh>
      <mesh position={[-1.6, 1.7, 4.05]}>
        <boxGeometry args={[3.2, 1.6, 0.08]} />
        <meshStandardMaterial color="#cdeaf5" emissive="#a8d4e8" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[2.4, 1.1, 4.05]}>
        <boxGeometry args={[1.3, 2.2, 0.08]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
    </group>
  )
}

/**
 * The airport terminal: a low, wide, glassy shed with a flat roof. Landside
 * (the +z face) is the entrance onto Main Street; the far side gives onto the
 * apron, so it reads as a building you pass through.
 */
export function Terminal({
  position,
  rotation = 0,
  width = 18,
  depth = 11,
  height = 5.4,
  color = '#d9dde2',
  roofColor = '#5a6b78',
}: BuildingProps & {
  width?: number
  depth?: number
  height?: number
  color?: string
  roofColor?: string
}) {
  const glassCols = Math.floor((width - 5) / 2.4)
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* flat roof with an overhanging canopy on the landside */}
      <mesh position={[0, height + 0.2, 0.6]} castShadow>
        <boxGeometry args={[width + 1.2, 0.4, depth + 2.4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      {/* canopy posts */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (width / 2 - 1.4), height / 2, depth / 2 + 1.5]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, height, 8]} />
          <meshStandardMaterial color="#9aa1a8" />
        </mesh>
      ))}
      {/* glazing, both faces — landside and out over the apron */}
      {Array.from({ length: glassCols }, (_, i) => (i - (glassCols - 1) / 2) * 2.4).map((x) => (
        <group key={x}>
          <mesh position={[x, 2.5, depth / 2 + 0.03]}>
            <boxGeometry args={[1.9, 2.6, 0.06]} />
            <meshStandardMaterial color="#bcdcec" emissive="#8fb8d4" emissiveIntensity={0.28} />
          </mesh>
          <mesh position={[x, 2.5, -depth / 2 - 0.03]}>
            <boxGeometry args={[1.9, 2.6, 0.06]} />
            <meshStandardMaterial color="#bcdcec" emissive="#8fb8d4" emissiveIntensity={0.28} />
          </mesh>
        </group>
      ))}
      {/* doors */}
      <mesh position={[0, 1.5, depth / 2 + 0.05]}>
        <boxGeometry args={[3.2, 3, 0.08]} />
        <meshStandardMaterial color="#37424c" />
      </mesh>
      <mesh position={[0, 1.5, -depth / 2 - 0.05]}>
        <boxGeometry args={[3.2, 3, 0.08]} />
        <meshStandardMaterial color="#37424c" />
      </mesh>
    </group>
  )
}

export function OfficeBuilding({
  position,
  rotation = 0,
  width = 10,
  depth = 10,
  height = 16,
  color = '#8fa3b8',
}: BuildingProps & { width?: number; depth?: number; height?: number; color?: string }) {
  const floors = Math.floor((height - 2) / 3)
  const cols = Math.floor((width - 2) / 2.2)
  const windows: [number, number][] = []
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * 2.2
      const y = 2.4 + f * 3
      windows.push([x, y])
    }
  }
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* roof lip + rooftop unit */}
      <mesh position={[0, height + 0.15, 0]}>
        <boxGeometry args={[width + 0.4, 0.3, depth + 0.4]} />
        <meshStandardMaterial color="#5c6670" />
      </mesh>
      <mesh position={[width / 6, height + 0.8, -depth / 6]} castShadow>
        <boxGeometry args={[2, 1.2, 1.6]} />
        <meshStandardMaterial color="#7d858d" />
      </mesh>
      {/* window grid, front and back */}
      {windows.map(([x, y], i) => (
        <group key={i}>
          <mesh position={[x, y, depth / 2 + 0.02]}>
            <boxGeometry args={[1.3, 1.5, 0.05]} />
            <meshStandardMaterial color="#b8d4e8" emissive="#8fb8d4" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[x, y, -depth / 2 - 0.02]}>
            <boxGeometry args={[1.3, 1.5, 0.05]} />
            <meshStandardMaterial color="#b8d4e8" emissive="#8fb8d4" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      {/* entrance */}
      <mesh position={[0, 1.4, depth / 2 + 0.03]}>
        <boxGeometry args={[2.6, 2.8, 0.06]} />
        <meshStandardMaterial color="#3d4852" />
      </mesh>
    </group>
  )
}
