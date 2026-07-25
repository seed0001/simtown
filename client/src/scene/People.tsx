import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { InteriorDef } from '../city/interiors'
import { RESIDENTS, fullName, type Resident } from '../city/residents'
import { nowTownTime } from '../sim/clock'
import { indoorPositionOf, outdoorPositionOf } from '../sim/presence'
import Person from './Person'
import { NameTag } from './TextLabel'

// Residents are always mounted and simply hidden when they are somewhere the
// player can't see them, so nobody pops in and out of the scene graph. Position
// comes from sim/presence, which is derived from the town clock — see the note
// at the top of that file about what replaces it.

/** Stagger the walk cycle so a group doesn't march in step. */
const phaseOf = (i: number) => i * 1.37

function ResidentActor({
  resident,
  phase,
  walking,
  locate,
}: {
  resident: Resident
  phase: number
  walking: boolean
  /** Where this resident is in the active space, or null when not visible here. */
  locate: () => { x: number; z: number; heading: number } | null
  }) {
  const root = useRef<THREE.Group>(null)
  const facing = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = root.current
    if (!g) return
    const at = locate()
    if (!at) {
      g.visible = false
      return
    }
    g.visible = true
    g.position.set(at.x, 0, at.z)
    if (facing.current) facing.current.rotation.y = at.heading
  })

  return (
    <group ref={root} visible={false}>
      <group ref={facing}>
        <Person appearance={resident.appearance} walking={walking} phase={phase} />
      </group>
      <NameTag text={fullName(resident)} position={[0, 2.02, 0]} />
    </group>
  )
}

/** Residents out on the street. Everyone outdoors is mid-commute, so all walk. */
export function StreetPeople() {
  return (
    <>
      {RESIDENTS.map((r, i) => (
        <ResidentActor
          key={r.id}
          resident={r}
          phase={phaseOf(i)}
          walking
          locate={() => outdoorPositionOf(r, nowTownTime())}
        />
      ))}
    </>
  )
}

/**
 * Residents inside the building the player is standing in. Indoor spots don't
 * move, so they're recomputed a few times a second rather than every frame.
 */
export function Occupants({ buildingId, def }: { buildingId: string; def: InteriorDef }) {
  const cache = useRef(new Map<string, { x: number; z: number; heading: number } | null>())
  const since = useRef(1) // start past the interval so the first frame fills the cache

  useFrame((_, delta) => {
    since.current += delta
    if (since.current < 0.2) return
    since.current = 0
    const t = nowTownTime()
    for (const r of RESIDENTS) {
      cache.current.set(r.id, indoorPositionOf(r, t, buildingId, def))
    }
  })

  return (
    <>
      {RESIDENTS.map((r, i) => (
        <ResidentActor
          key={r.id}
          resident={r}
          phase={phaseOf(i)}
          walking={false}
          locate={() => cache.current.get(r.id) ?? null}
        />
      ))}
    </>
  )
}
