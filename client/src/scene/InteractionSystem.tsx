import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BUILDINGS, addressOf, doorWorld } from '../city/registry'
import { getInterior } from '../city/interiors'
import { RESIDENTS, fullName } from '../city/residents'
import { nowTownTime } from '../sim/clock'
import { describePresence, indoorPositionOf, outdoorPositionOf } from '../sim/presence'

/**
 * Where 'exit' from the current interior lands you. `id: null` means the street;
 * a string is another interior (the school hallway, when you're in a classroom).
 * `pos` is the camera position to restore in that space.
 */
export interface ReturnFrame {
  id: string | null
  pos: [number, number, number]
}

export type Mode =
  | { view: 'city' }
  | { view: 'interior'; id: string; stack: ReturnFrame[] }

export interface Nearby {
  id: string
  label: string
  sub?: string
  canAct: boolean
  action: 'enter' | 'exit'
  /** set when this door leads to another interior (a classroom off the hallway) */
  toId?: string
  /** people take priority over doors, and can't be acted on yet */
  kind: 'door' | 'person'
}

const DOORS = BUILDINGS.map((b) => ({ b, door: doorWorld(b) }))

const NOTICE_DIST = 11 // show the address when this close to a door
const ENTER_DIST = 3.4 // allow entering
const EXIT_DIST = 2.6
const PERSON_DIST = 4.5 // show who someone is when this close

/** World-local trigger point just inside an interior portal door. */
function portalPoint(def: { width: number }, wall: 'left' | 'right'): number {
  return (wall === 'left' ? -1 : 1) * (def.width / 2 - 0.7)
}

export default function InteractionSystem({
  mode,
  setNearby,
  onEnter,
  onExit,
}: {
  mode: Mode
  setNearby: (n: Nearby | null) => void
  /** step into `toId`, remembering where we came from to return to */
  onEnter: (toId: string, from: ReturnFrame) => void
  onExit: () => void
}) {
  const camera = useThree((s) => s.camera)
  const nearbyRef = useRef<Nearby | null>(null)
  // what E acts on — always a door, even when the card is showing a person
  const doorRef = useRef<Nearby | null>(null)
  const modeRef = useRef(mode)
  modeRef.current = mode
  const accum = useRef(0)

  useFrame((_, delta) => {
    accum.current += delta
    if (accum.current < 0.1) return
    accum.current = 0

    const px = camera.position.x
    const pz = camera.position.z
    const mode = modeRef.current
    let next: Nearby | null = null

    if (mode.view === 'city') {
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
          kind: 'door',
        }
      }
    } else {
      const def = getInterior(mode.id)
      let bestD = Infinity
      // the way out, centered on the +z wall
      const dExit = Math.hypot(px, pz - def.depth / 2)
      if (dExit < NOTICE_DIST) {
        const toStreet = (mode.stack[mode.stack.length - 1]?.id ?? null) === null
        next = {
          id: mode.id,
          label: toStreet ? 'Leave building' : 'Back to the hallway',
          canAct: dExit < EXIT_DIST,
          action: 'exit',
          kind: 'door',
        }
        bestD = dExit
      }
      // classroom doors along the hallway walls
      for (const p of def.portals ?? []) {
        const d = Math.hypot(px - portalPoint(def, p.wall), pz - p.z)
        if (d < NOTICE_DIST && d < bestD) {
          bestD = d
          next = {
            id: p.toId,
            label: p.label,
            canAct: d < ENTER_DIST,
            action: 'enter',
            toId: p.toId,
            kind: 'door',
          }
        }
      }
    }

    // someone standing right in front of you outranks whatever door is nearby
    const town = nowTownTime()
    let closest: { d: number; label: string; sub: string; id: string } | null = null
    for (const r of RESIDENTS) {
      const at =
        mode.view === 'city'
          ? outdoorPositionOf(r, town)
          : indoorPositionOf(r, town, mode.id, getInterior(mode.id))
      if (!at) continue
      const d = Math.hypot(at.x - px, at.z - pz)
      if (d < PERSON_DIST && (!closest || d < closest.d)) {
        closest = {
          d,
          id: r.id,
          label: fullName(r),
          sub: `${r.job.title} · ${describePresence(r, town)}`,
        }
      }
    }
    // the door stays actionable even while a person is being shown
    doorRef.current = next
    if (closest) {
      next = {
        id: closest.id,
        label: closest.label,
        sub: closest.sub,
        canAct: false,
        action: 'enter',
        kind: 'person',
      }
    }

    const prev = nearbyRef.current
    const changed =
      (prev === null) !== (next === null) ||
      (prev &&
        next &&
        (prev.id !== next.id ||
          prev.canAct !== next.canAct ||
          prev.action !== next.action ||
          prev.sub !== next.sub))
    if (changed) {
      nearbyRef.current = next
      setNearby(next)
    }
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      const nearby = doorRef.current
      const m = modeRef.current
      if (!nearby?.canAct) return
      const here: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z]

      const stepInto = (toId: string, fromId: string | null) => {
        const def = getInterior(toId)
        // spawn just inside the door, facing into the room
        camera.position.set(0, 1.7, def.depth / 2 - 1.6)
        camera.rotation.set(0, 0, 0)
        nearbyRef.current = null
        doorRef.current = null
        setNearby(null)
        onEnter(toId, { id: fromId, pos: here })
      }

      if (m.view === 'city' && nearby.action === 'enter') {
        stepInto(nearby.id, null)
      } else if (m.view === 'interior' && nearby.action === 'enter' && nearby.toId) {
        stepInto(nearby.toId, m.id)
      } else if (m.view === 'interior' && nearby.action === 'exit') {
        const frame = m.stack[m.stack.length - 1]
        camera.position.set(...frame.pos)
        if (frame.id === null) {
          const b = BUILDINGS.find((x) => x.id === m.id)
          camera.rotation.set(0, (b?.rotation ?? 0) + Math.PI, 0)
        } else {
          // face back down the hallway toward its middle
          camera.rotation.set(0, frame.pos[2] > 0 ? 0 : Math.PI, 0)
        }
        nearbyRef.current = null
        doorRef.current = null
        setNearby(null)
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [camera, onEnter, onExit, setNearby])

  return null
}
