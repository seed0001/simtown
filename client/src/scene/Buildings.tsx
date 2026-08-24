// Low-poly procedural buildings. All buildings sit on y=0 and face +z in local
// space — use the rotation prop to orient them toward a road.
//
// Every building gets a body/roof/accent color, and the big wall surfaces
// carry the shared grain texture so light gives them tooth. Warm window glass
// glows faintly gold against whatever the walls are doing.

import { GRAIN_BUMP, grainTexture } from './grain'
import { roofWeathering, wallWeathering } from './weatheredMaterial'

type BuildingProps = {
  position: [number, number, number]
  rotation?: number
}

export type RoofStyle = 'pyramid' | 'gabled' | 'flat' | 'shed'

type HouseFeatures = { porch?: boolean; dormer?: boolean; garage?: boolean; secondChimney?: boolean }

export function House({
  position,
  rotation = 0,
  bodyColor = '#c9d6e8',
  roofColor = '#5a4636',
  width = 6,
  depth = 5,
  height = 3.2,
  roofStyle = 'pyramid',
  porch = false,
  dormer = false,
  garage = false,
  secondChimney = false,
}: BuildingProps & {
  bodyColor?: string
  roofColor?: string
  width?: number
  depth?: number
  height?: number
  roofStyle?: RoofStyle
} & HouseFeatures) {
  const halfW = width / 2
  const halfD = depth / 2
  const windowX = halfW - 1.2
  const doorZ = halfD + 0.01

  // rise of the roof peak above the wall top, tuned per style so the
  // chimney (below) still pokes out above whichever roof is active
  const roofRise =
    roofStyle === 'pyramid' ? height * 0.6875 : roofStyle === 'gabled' ? height * 0.5 : roofStyle === 'shed' ? height * 0.44 : 0.4
  const chimneyY = height + roofRise - 0.4

  return (
    <group position={position} rotation-y={rotation}>
      {/* body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={bodyColor}
          bumpMap={grainTexture(5)}
          bumpScale={GRAIN_BUMP}
          onBeforeCompile={wallWeathering}
        />
      </mesh>

      {roofStyle === 'pyramid' && (
        <mesh position={[0, height + roofRise / 2, 0]} rotation-y={Math.PI / 4} castShadow>
          <coneGeometry args={[Math.hypot(halfW, halfD) * 1.12, roofRise, 4]} />
          <meshStandardMaterial color={roofColor} flatShading onBeforeCompile={roofWeathering} />
        </mesh>
      )}
      {roofStyle === 'gabled' &&
        [1, -1].map((s) => {
          const span = halfD + 0.5
          const slant = Math.hypot(roofRise, span)
          const angle = Math.atan2(roofRise, span)
          return (
            <mesh key={s} position={[0, height + roofRise / 2, (s * span) / 2]} rotation-x={s * angle} castShadow>
              <boxGeometry args={[width + 0.6, 0.15, slant]} />
              <meshStandardMaterial color={roofColor} flatShading onBeforeCompile={roofWeathering} />
            </mesh>
          )
        })}
      {roofStyle === 'shed' &&
        (() => {
          const span = depth + 1
          const slant = Math.hypot(roofRise, span)
          const angle = Math.atan2(roofRise, span)
          return (
            <mesh position={[0, height + roofRise / 2, 0]} rotation-x={angle} castShadow>
              <boxGeometry args={[width + 0.6, 0.15, slant]} />
              <meshStandardMaterial color={roofColor} flatShading onBeforeCompile={roofWeathering} />
            </mesh>
          )
        })()}
      {roofStyle === 'flat' && (
        <mesh position={[0, height + 0.15, 0]} castShadow>
          <boxGeometry args={[width + 0.4, 0.3, depth + 0.4]} />
          <meshStandardMaterial color={roofColor} onBeforeCompile={roofWeathering} />
        </mesh>
      )}

      {/* chimney */}
      <mesh position={[halfW * 0.53, chimneyY, -halfD * 0.4]} castShadow>
        <boxGeometry args={[0.7, 1.6, 0.7]} />
        <meshStandardMaterial color="#8a5a42" />
      </mesh>
      {secondChimney && (
        <mesh position={[-halfW * 0.45, chimneyY, halfD * 0.3]} castShadow>
          <boxGeometry args={[0.6, 1.4, 0.6]} />
          <meshStandardMaterial color="#8a5a42" />
        </mesh>
      )}

      {/* door */}
      <mesh position={[0, 1, doorZ]}>
        <boxGeometry args={[1.1, 2, 0.08]} />
        <meshStandardMaterial color="#4a2f1e" />
      </mesh>
      {/* windows */}
      {[-windowX, windowX].map((x) => (
        <mesh key={x} position={[x, 1.9, doorZ]}>
          <boxGeometry args={[1.2, 1, 0.08]} />
          <meshStandardMaterial color="#f2e6b0" emissive="#e8d68c" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* porch: deck, thin roof slab, and two posts over the front door */}
      {porch &&
        (() => {
          const porchWidth = Math.min(width * 0.55, 3.4)
          const deckZ = halfD + 0.85
          return (
            <group>
              <mesh position={[0, 0.15, deckZ]} receiveShadow>
                <boxGeometry args={[porchWidth, 0.25, 1.6]} />
                <meshStandardMaterial color="#c9b48a" />
              </mesh>
              <mesh position={[0, 2.3, deckZ]} castShadow>
                <boxGeometry args={[porchWidth + 0.3, 0.12, 1.8]} />
                <meshStandardMaterial color={roofColor} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * (porchWidth / 2 - 0.2), 1.15, deckZ + 0.6]} castShadow>
                  <cylinderGeometry args={[0.08, 0.08, 2.1, 8]} />
                  <meshStandardMaterial color="#e8e0d0" />
                </mesh>
              ))}
            </group>
          )
        })()}

      {/* garage: an attached single-story bay on the west side */}
      {garage &&
        (() => {
          const gW = 2.4
          const gD = depth * 0.85
          const gH = height * 0.75
          const gX = -(halfW + gW / 2 - 0.3)
          return (
            <group>
              <mesh position={[gX, gH / 2, -0.2]} castShadow receiveShadow>
                <boxGeometry args={[gW, gH, gD]} />
                <meshStandardMaterial
                  color={bodyColor}
                  bumpMap={grainTexture(4)}
                  bumpScale={GRAIN_BUMP}
                  onBeforeCompile={wallWeathering}
                />
              </mesh>
              <mesh position={[gX, gH + 0.1, -0.2]} castShadow>
                <boxGeometry args={[gW + 0.2, 0.2, gD + 0.2]} />
                <meshStandardMaterial color={roofColor} onBeforeCompile={roofWeathering} />
              </mesh>
              <mesh position={[gX, gH * 0.4, -0.2 + gD / 2 + 0.01]}>
                <boxGeometry args={[gW - 0.4, gH - 0.5, 0.06]} />
                <meshStandardMaterial color="#3a2e22" />
              </mesh>
            </group>
          )
        })()}

      {/* dormer: a small gabled window bump on the front roof slope */}
      {dormer && (
        <group position={[halfW * 0.35, height + roofRise * 0.4, halfD * 0.45]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.3, 1, 1]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0, 0.7, 0]} rotation-y={Math.PI / 4} castShadow>
            <coneGeometry args={[0.95, 0.7, 4]} />
            <meshStandardMaterial color={roofColor} flatShading />
          </mesh>
          <mesh position={[0, 0, 0.51]}>
            <boxGeometry args={[0.6, 0.55, 0.06]} />
            <meshStandardMaterial color="#f2e6b0" emissive="#e8d68c" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}

export function Restaurant({
  position,
  rotation = 0,
  color = '#eee2c8',
  accentColor = '#1f6b6b',
}: BuildingProps & { color?: string; accentColor?: string }) {
  return (
    <group position={position} rotation-y={rotation}>
      {/* body */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[14, 4, 10]} />
        <meshStandardMaterial
          color={color}
          bumpMap={grainTexture(8)}
          bumpScale={GRAIN_BUMP}
          onBeforeCompile={wallWeathering}
        />
      </mesh>
      {/* parapet */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <boxGeometry args={[14.4, 0.4, 10.4]} />
        <meshStandardMaterial color={accentColor} onBeforeCompile={roofWeathering} />
      </mesh>
      {/* striped awning */}
      {[-5, -3, -1, 1, 3, 5].map((x, i) => (
        <mesh key={x} position={[x, 3.1, 5.8]} rotation-x={0.35}>
          <boxGeometry args={[2, 0.12, 1.8]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#c23b3b' : '#f2ede0'} />
        </mesh>
      ))}
      {/* storefront windows */}
      {[-4.2, 4.2].map((x) => (
        <mesh key={x} position={[x, 1.9, 5.05]}>
          <boxGeometry args={[4, 1.8, 0.08]} />
          <meshStandardMaterial color="#f4e9b8" emissive="#f0dfa0" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* door */}
      <mesh position={[0, 1.2, 5.05]}>
        <boxGeometry args={[1.5, 2.4, 0.08]} />
        <meshStandardMaterial color="#3a2418" />
      </mesh>
      {/* roof sign: dark red panel with a glowing gold bar (reads as "DINER") */}
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, 4.9, 3.5]}>
          <boxGeometry args={[0.25, 1.2, 0.25]} />
          <meshStandardMaterial color="#4a2020" />
        </mesh>
      ))}
      <mesh position={[0, 5.9, 3.5]} castShadow>
        <boxGeometry args={[6.5, 1.7, 0.4]} />
        <meshStandardMaterial color="#7a2020" />
      </mesh>
      <mesh position={[0, 5.9, 3.72]}>
        <boxGeometry args={[5.4, 0.8, 0.06]} />
        <meshStandardMaterial color="#ffe9a8" emissive="#ffd97a" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

export function GasStation({
  position,
  rotation = 0,
  color = '#e8e0cc',
  accentColor = '#c23b3b',
}: BuildingProps & { color?: string; accentColor?: string }) {
  return (
    <group position={position} rotation-y={rotation}>
      {/* concrete pad */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[18, 0.1, 14]} />
        <meshStandardMaterial color="#a29a89" bumpMap={grainTexture(10)} bumpScale={GRAIN_BUMP} />
      </mesh>
      {/* canopy */}
      <mesh position={[0, 5, 1.5]} castShadow>
        <boxGeometry args={[12, 0.5, 8]} />
        <meshStandardMaterial color="#f2f2ec" onBeforeCompile={roofWeathering} />
      </mesh>
      {/* red fascia stripe on canopy front */}
      <mesh position={[0, 5, 5.55]}>
        <boxGeometry args={[12, 0.5, 0.15]} />
        <meshStandardMaterial color={accentColor} />
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
          <meshStandardMaterial color="#dcd6c4" />
        </mesh>
      ))}
      {/* fuel pumps */}
      {[-2.2, 2.2].map((x) => (
        <group key={x} position={[x, 0, 1.5]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.9, 1.3, 0.6]} />
            <meshStandardMaterial color="#f0ede4" />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[0.92, 0.35, 0.62]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
        </group>
      ))}
      {/* shop */}
      <mesh position={[0, 1.75, -4.8]} castShadow receiveShadow>
        <boxGeometry args={[9, 3.5, 5]} />
        <meshStandardMaterial
          color={color}
          bumpMap={grainTexture(6)}
          bumpScale={GRAIN_BUMP}
          onBeforeCompile={wallWeathering}
        />
      </mesh>
      <mesh position={[0, 1.6, -2.26]}>
        <boxGeometry args={[6, 1.8, 0.08]} />
        <meshStandardMaterial color="#f2e6b0" emissive="#e8d68c" emissiveIntensity={0.35} />
      </mesh>
      {/* tall road sign */}
      <group position={[7.5, 0, 5.5]}>
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 6, 8]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
        <mesh position={[0, 6.6, 0]} castShadow>
          <boxGeometry args={[2.6, 1.8, 0.3]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
        <mesh position={[0, 6.6, 0.18]}>
          <boxGeometry args={[2, 0.7, 0.06]} />
          <meshStandardMaterial color="#ffe9a8" emissive="#ffd97a" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  )
}

export function Shop({
  position,
  rotation = 0,
  color = '#d8cdb0',
  awningColor = '#4a3a2a',
  width = 8,
  depth = 8,
  height = 3.5,
}: BuildingProps & { color?: string; awningColor?: string; width?: number; depth?: number; height?: number }) {
  const halfD = depth / 2
  const frontZ = halfD + 0.05
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          bumpMap={grainTexture(6)}
          bumpScale={GRAIN_BUMP}
          onBeforeCompile={wallWeathering}
        />
      </mesh>
      <mesh position={[0, height + 0.2, 0]} castShadow>
        <boxGeometry args={[width + 0.4, 0.4, depth + 0.4]} />
        <meshStandardMaterial color="#7a6a52" onBeforeCompile={roofWeathering} />
      </mesh>
      <mesh position={[0, height - 0.5, halfD + 0.6]} rotation-x={0.35}>
        <boxGeometry args={[width - 1, 0.12, 1.5]} />
        <meshStandardMaterial color={awningColor} />
      </mesh>
      <mesh position={[-width * 0.2, height * 0.49, frontZ]}>
        <boxGeometry args={[width * 0.4, height * 0.46, 0.08]} />
        <meshStandardMaterial color="#f2e6b0" emissive="#e8d68c" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[width * 0.3, height * 0.31, frontZ]}>
        <boxGeometry args={[1.3, height * 0.63, 0.08]} />
        <meshStandardMaterial color="#332318" />
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
  color = '#c7d3da',
  roofColor = '#3d4a52',
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
        <meshStandardMaterial
          color={color}
          bumpMap={grainTexture(8)}
          bumpScale={GRAIN_BUMP}
          onBeforeCompile={wallWeathering}
        />
      </mesh>
      {/* flat roof with an overhanging canopy on the landside */}
      <mesh position={[0, height + 0.2, 0.6]} castShadow>
        <boxGeometry args={[width + 1.2, 0.4, depth + 2.4]} />
        <meshStandardMaterial color={roofColor} onBeforeCompile={roofWeathering} />
      </mesh>
      {/* canopy posts */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (width / 2 - 1.4), height / 2, depth / 2 + 1.5]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, height, 8]} />
          <meshStandardMaterial color="#b8c0c4" />
        </mesh>
      ))}
      {/* glazing, both faces — landside and out over the apron */}
      {Array.from({ length: glassCols }, (_, i) => (i - (glassCols - 1) / 2) * 2.4).map((x) => (
        <group key={x}>
          <mesh position={[x, 2.5, depth / 2 + 0.03]}>
            <boxGeometry args={[1.9, 2.6, 0.06]} />
            <meshStandardMaterial color="#a8c8dc" emissive="#8fb8d0" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[x, 2.5, -depth / 2 - 0.03]}>
            <boxGeometry args={[1.9, 2.6, 0.06]} />
            <meshStandardMaterial color="#a8c8dc" emissive="#8fb8d0" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      {/* doors */}
      <mesh position={[0, 1.5, depth / 2 + 0.05]}>
        <boxGeometry args={[3.2, 3, 0.08]} />
        <meshStandardMaterial color="#2a3540" />
      </mesh>
      <mesh position={[0, 1.5, -depth / 2 - 0.05]}>
        <boxGeometry args={[3.2, 3, 0.08]} />
        <meshStandardMaterial color="#2a3540" />
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
  color = '#7d97ab',
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
        <meshStandardMaterial
          color={color}
          bumpMap={grainTexture(6, 10)}
          bumpScale={GRAIN_BUMP}
          onBeforeCompile={wallWeathering}
        />
      </mesh>
      {/* roof lip + rooftop unit */}
      <mesh position={[0, height + 0.15, 0]}>
        <boxGeometry args={[width + 0.4, 0.3, depth + 0.4]} />
        <meshStandardMaterial color="#4a5a66" onBeforeCompile={roofWeathering} />
      </mesh>
      <mesh position={[width / 6, height + 0.8, -depth / 6]} castShadow>
        <boxGeometry args={[2, 1.2, 1.6]} />
        <meshStandardMaterial color="#5f7080" />
      </mesh>
      {/* window grid, front and back */}
      {windows.map(([x, y], i) => (
        <group key={i}>
          <mesh position={[x, y, depth / 2 + 0.02]}>
            <boxGeometry args={[1.3, 1.5, 0.05]} />
            <meshStandardMaterial color="#9fc4dd" emissive="#7fb0d0" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[x, y, -depth / 2 - 0.02]}>
            <boxGeometry args={[1.3, 1.5, 0.05]} />
            <meshStandardMaterial color="#9fc4dd" emissive="#7fb0d0" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      {/* entrance */}
      <mesh position={[0, 1.4, depth / 2 + 0.03]}>
        <boxGeometry args={[2.6, 2.8, 0.06]} />
        <meshStandardMaterial color="#2a3540" />
      </mesh>
    </group>
  )
}
