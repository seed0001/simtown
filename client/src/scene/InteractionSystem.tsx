import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BUILDINGS, addressOf, doorWorld } from '../city/registry'
import { getInterior } from '../city/interiors'

export type Mode =
  | { view: 'city' }
  | { view: 'interior'; id: string; returnPos: [number, number, number] }

export interface Nearby {
  id: string
  label: string
  sub?: string
  canAct: boolean
  action: 'enter' | 'exit'
}

const DOORS = BUILDINGS.map((b) => ({ b, door: doorWorld(b) }))

const NOTICE_DIST = 11 // show the address when this close to a door
const ENTER_DIST = 3.4 // allow entering
const EXIT_DIST = 2.6

export default function InteractionSystem({
  mode,
  setNearby,
  onEnter,
  onExit,
}: {
  mode: Mode
  setNearby: (n: Nearby | null) => void
  onEnter: (id: string, returnPos: [number, number, number]) => void
  onExit: () => void
}) {
  const camera = useThree((s) => s.camera)
  const nearbyRef = useRef<Nearby | null>(null)
  const modeRef = useRef(mode)
  modeRef.current = mode
  const accum = useRef(0)

  useFrame((_, delta) => {
    accum.current += delta
    if (accum.current < 0.1) return
    accum.current = 0

    const px = camera.position.x
    const pz = camera.position.z
    let next: Nearby | null = null

    if (modeRef.current.view === 'city') {
      let best: { d: number; entry: (typeof DOORS)[number] } | null = null
      for (const entry of DOORS) {
        const dx = entry.door.x - px
        const dz = entry.door.z - pz
        const d = Math.hypot(dx, dz)
        if (d < NOTICE_DIST && (!best || d < best.d)) best = { d, entry }
      }
      if (best) {
        next = {
          id: best.entry.b.id,
          label: addressOf(best.entry.b),
          sub: best.entry.b.name,
          canAct: best.d < ENTER_DIST,
          action: 'enter',
        }
      }
    } else {
      const def = getInterior(modeRef.current.id)
      const d = Math.hypot(px, pz - def.depth / 2)
      if (d < EXIT_DIST) {
        next = { id: modeRef.current.id, label: 'Leave building', canAct: true, action: 'exit' }
      }
    }

    const prev = nearbyRef.current
    const changed =
      (prev === null) !== (next === null) ||
      (prev && next && (prev.id !== next.id || prev.canAct !== next.canAct || prev.action !== next.action))
    if (changed) {
      nearbyRef.current = next
      setNearby(next)
    }
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      const nearby = nearbyRef.current
      const m = modeRef.current
      if (!nearby?.canAct) return

      if (m.view === 'city' && nearby.action === 'enter') {
        const returnPos: [number, number, number] = [
          camera.position.x,
          camera.position.y,
          camera.position.z,
        ]
        const def = getInterior(nearby.id)
        // spawn just inside the door, facing into the room
        camera.position.set(0, 1.7, def.depth / 2 - 1.6)
        camera.rotation.set(0, 0, 0)
        nearbyRef.current = null
        setNearby(null)
        onEnter(nearby.id, returnPos)
      } else if (m.view === 'interior' && nearby.action === 'exit') {
        const b = BUILDINGS.find((x) => x.id === m.id)
        camera.position.set(...m.returnPos)
        // face away from the door on the way out
        camera.rotation.set(0, (b?.rotation ?? 0) + Math.PI, 0)
        nearbyRef.current = null
        setNearby(null)
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [camera, onEnter, onExit, setNearby])

  return null
}
