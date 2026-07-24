import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CityScene from './scene/CityScene'
import Interior from './scene/Interior'
import Player, { type Bounds } from './scene/Player'
import InteractionSystem, { type Mode, type Nearby } from './scene/InteractionSystem'
import { BUILDINGS, addressOf, getBuilding } from './city/registry'
import { getInterior } from './city/interiors'

const CITY_BOUNDS: Bounds = { minX: -78, maxX: 78, minZ: -78, maxZ: 78 }

export default function App() {
  const [locked, setLocked] = useState(false)
  const [mode, setMode] = useState<Mode>({ view: 'city' })
  const [nearby, setNearby] = useState<Nearby | null>(null)

  const handleEnter = useCallback((id: string, returnPos: [number, number, number]) => {
    setMode({ view: 'interior', id, returnPos })
  }, [])
  const handleExit = useCallback(() => {
    setMode({ view: 'city' })
  }, [])

  const insideBuilding = mode.view === 'interior' ? getBuilding(mode.id) : null
  const bounds: Bounds =
    mode.view === 'interior'
      ? (() => {
          const def = getInterior(mode.id)
          return {
            minX: -def.width / 2 + 0.5,
            maxX: def.width / 2 - 0.5,
            minZ: -def.depth / 2 + 0.5,
            maxZ: def.depth / 2 - 0.4,
          }
        })()
      : CITY_BOUNDS

  return (
    <>
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 400, position: [0, 1.7, 26] }}
        dpr={[1, 2]}
      >
        {mode.view === 'city' ? <CityScene /> : <Interior def={getInterior(mode.id)} />}
        <Player onLockChange={setLocked} bounds={bounds} />
        <InteractionSystem
          mode={mode}
          setNearby={setNearby}
          onEnter={handleEnter}
          onExit={handleExit}
        />
      </Canvas>

      {!locked && (
        <div className="enter-overlay">
          <h1>SIMTOWN</h1>
          <p>An AI city · {BUILDINGS.length} addresses on 6 streets</p>
          <div className="badge">Click anywhere to walk around</div>
        </div>
      )}

      {locked && insideBuilding && (
        <div className="chip">
          Inside {addressOf(insideBuilding)} · {insideBuilding.name}
        </div>
      )}

      {locked && nearby && (
        <div className="nearby-card">
          <div className="addr">{nearby.label}</div>
          {nearby.sub && <div className="sub">{nearby.sub}</div>}
          {nearby.canAct && (
            <div className="prompt">Press E to {nearby.action === 'enter' ? 'enter' : 'exit'}</div>
          )}
        </div>
      )}

      {locked && (
        <div className="hint">WASD move · Shift sprint · E enter/exit · Esc release cursor</div>
      )}
    </>
  )
}
