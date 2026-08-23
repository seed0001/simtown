// A ring of low-poly peaks around the town: north, west, and south. The east
// side stays open — that's the airfield, and the flight paths in airport.ts
// run straight north-south at x=118. The north and south walls run
// east-west and stop well short of x=118 so nothing sits near the runway.
// The west wall has a gap at z≈0, in line with Main Street, framed by two
// closer "gateway" peaks — the valley pass in and out of town.
//
// Layout is a fixed deterministic sequence, not Math.random(), so the
// skyline is stable across reloads — same spirit as TREES/STREETLIGHTS in
// CityScene.tsx and the flight schedule in airport.ts. Spacing and size are
// irregular on purpose: a real range isn't a row of identical, evenly-spaced
// cones — it's a mix of low foothills, wide humps, and the occasional giant.

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

interface Peak {
  position: [number, number, number]
  height: number
  radius: number
  rockColor: string
  snow: boolean
}

const ROCK_COLORS = ['#746c5a', '#807761', '#665f4f', '#8c8268', '#5c5646']

/**
 * A wall of peaks running along one axis. `along` is the axis that sweeps
 * from `from` to `to`; `at` is the roughly-fixed coordinate on the other
 * axis. Step size, height, and radius are all independently randomized and
 * wide-ranging, so the wall reads as an uneven natural range, not a fence.
 */
function buildWall(
  along: 'x' | 'z',
  at: number,
  from: number,
  to: number,
  seedBase: number,
  gap?: [number, number],
): Peak[] {
  const peaks: Peak[] = []
  let t = from
  let i = 0
  while (t <= to) {
    const s = seedBase + i * 19
    const step = 10 + seededRandom(s) * 44 // 10–54 apart — clustered in places, gappy in others

    if (!(gap && t > gap[0] && t < gap[1])) {
      const jitter = (seededRandom(s + 1) - 0.5) * 10
      const cross = at + (seededRandom(s + 2) - 0.5) * 40
      // skewed toward low hills, with real giants thrown in
      const height = 12 + Math.pow(seededRandom(s + 3), 2.2) * 100
      const radius = 10 + seededRandom(s + 4) * 46
      const sweep = t + jitter

      const position: [number, number, number] =
        along === 'x' ? [sweep, 0, cross] : [cross, 0, sweep]

      peaks.push({
        position,
        height,
        radius,
        rockColor: ROCK_COLORS[i % ROCK_COLORS.length],
        snow: height > 60,
      })
    }
    t += step
    i++
  }
  return peaks
}

// the pass: Main Street's latitude (z≈0), cut through the west wall
const VALLEY_GAP: [number, number] = [-26, 26]

const RIDGES: Peak[] = [
  ...buildWall('x', -155, -190, 20, 10), // north wall — stays under x=20, ~100 clear of the runway
  ...buildWall('z', -160, -190, 190, 200, VALLEY_GAP), // west wall — gapped for the pass
  ...buildWall('x', 155, -190, 20, 400), // south wall — stays under x=20, ~100 clear of the runway
]

// taller peaks flanking the pass, closer in, framing the opening
const GATEWAY_PEAKS: Peak[] = [
  { position: [-108, 0, -32], height: 58, radius: 20, rockColor: '#665f4f', snow: true },
  { position: [-108, 0, 34], height: 64, radius: 23, rockColor: '#746c5a', snow: true },
]

const ALL_PEAKS = [...RIDGES, ...GATEWAY_PEAKS]

function PeakMesh({ position, height, radius, rockColor, snow }: Peak) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <coneGeometry args={[radius, height, 6, 1]} />
        <meshStandardMaterial color={rockColor} flatShading roughness={1} />
      </mesh>
      {snow && (
        <mesh position={[0, height * 0.86, 0]}>
          <coneGeometry args={[radius * 0.3, height * 0.26, 6, 1]} />
          <meshStandardMaterial color="#eef1ee" flatShading roughness={0.9} />
        </mesh>
      )}
    </group>
  )
}

export default function Mountains() {
  return (
    <group>
      {ALL_PEAKS.map((p, i) => (
        <PeakMesh key={i} {...p} />
      ))}
    </group>
  )
}
