import { useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CityScene from './scene/CityScene'
import Interior from './scene/Interior'
import Player, { type Bounds } from './scene/Player'
import InteractionSystem, { type Mode, type Nearby } from './scene/InteractionSystem'
import VoiceConversation, { type VoiceState } from './scene/VoiceConversation'
import { BUILDINGS, addressOf, getBuilding } from './city/registry'
import { getInterior } from './city/interiors'
import { RESIDENTS } from './city/residents'
import { formatTownTime, nowTownTime } from './sim/clock'

// extends east and north to take in the airfield (city/airport.ts)
const CITY_BOUNDS: Bounds = { minX: -78, maxX: 138, minZ: -88, maxZ: 78 }

/** Ticks the town clock for the HUD. The scene reads the clock directly. */
function useTownClockLabel() {
  const [label, setLabel] = useState(() => formatTownTime(nowTownTime()))
  useEffect(() => {
    const id = setInterval(() => setLabel(formatTownTime(nowTownTime())), 500)
    return () => clearInterval(id)
  }, [])
  return label
}

export default function App() {
  const [locked, setLocked] = useState(false)
  const [mode, setMode] = useState<Mode>({ view: 'city' })
  const [nearby, setNearby] = useState<Nearby | null>(null)
  const [voice, setVoice] = useState<VoiceState | null>(null)
  const townTime = useTownClockLabel()

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
        {mode.view === 'city' ? (
          <CityScene />
        ) : (
          <Interior id={mode.id} def={getInterior(mode.id)} />
        )}
        <Player onLockChange={setLocked} bounds={bounds} />
        <InteractionSystem
          mode={mode}
          setNearby={setNearby}
          onEnter={handleEnter}
          onExit={handleExit}
        />
        <VoiceConversation mode={mode} onStateChange={setVoice} />
      </Canvas>

      {/* paper grain over the whole frame; HUD elements below stack above it */}
      <div className="grain-overlay" />

      {!locked && (
        <div className="enter-overlay">
          <h1>SIMTOWN</h1>
          <p>
            An AI city · {BUILDINGS.length} addresses on 6 streets · {RESIDENTS.length} residents
          </p>
          <div className="badge">Click anywhere to walk around</div>
        </div>
      )}

      {locked && <div className="clock">{townTime}</div>}

      {locked && insideBuilding && (
        <div className="chip">
          Inside {addressOf(insideBuilding)} · {insideBuilding.name}
        </div>
      )}

      {/* the voice caption takes over this spot once a conversation with them has actually started */}
      {locked && nearby && !(nearby.kind === 'person' && voice) && (
        <div className={nearby.kind === 'person' ? 'nearby-card person' : 'nearby-card'}>
          <div className="addr">{nearby.label}</div>
          {nearby.sub && <div className="sub">{nearby.sub}</div>}
          {nearby.canAct && (
            <div className="prompt">Press E to {nearby.action === 'enter' ? 'enter' : 'exit'}</div>
          )}
        </div>
      )}

      {locked && voice && (
        <div className="voice-caption">
          <div className="who">
            {voice.residentName}
            {voice.status === 'greeting' && ' · walking up'}
            {voice.status === 'thinking' && ' · thinking'}
            {voice.status === 'listening' && ' · listening'}
            {voice.status === 'unavailable' && " · can't talk right now"}
          </div>
          {voice.lastLine && (
            <div className={voice.lastLine.speaker === 'you' ? 'line you' : 'line them'}>
              {voice.lastLine.text}
            </div>
          )}
        </div>
      )}

      {locked && (
        <div className="hint">WASD move · Shift sprint · E enter/exit · Esc release cursor · walk up to someone to talk</div>
      )}
    </>
  )
}
