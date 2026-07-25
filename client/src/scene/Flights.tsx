import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLIGHTS, type Flight } from '../city/airport'
import { nowTownTime } from '../sim/clock'
import { flightStateOf } from '../sim/flights'
import { Helicopter, SmallPlane } from './Aircraft'
import { NameTag } from './TextLabel'

// Every scheduled aircraft is mounted and hidden when it isn't flying, the same
// way residents are, so nothing pops into the scene graph mid-approach.
//
// Heading and pitch are split across two nested groups on purpose: setting both
// on one object rotates the nose about the world X axis, which tips an aircraft
// sideways on any heading but due north. Yaw outside, pitch inside.

function FlightActor({ flight }: { flight: Flight }) {
  const root = useRef<THREE.Group>(null)
  const yaw = useRef<THREE.Group>(null)
  const pitch = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = root.current
    if (!g) return
    const state = flightStateOf(flight, nowTownTime())
    if (!state) {
      g.visible = false
      return
    }
    g.visible = true
    g.position.set(state.x, state.y, state.z)
    if (yaw.current) yaw.current.rotation.y = state.heading
    if (pitch.current) pitch.current.rotation.x = -state.pitch
  })

  return (
    <group ref={root} visible={false}>
      <group ref={yaw}>
        <group ref={pitch}>
          {flight.craft === 'helicopter' ? (
            <Helicopter livery={flight.livery} accent={flight.accent} />
          ) : (
            <SmallPlane livery={flight.livery} accent={flight.accent} />
          )}
        </group>
      </group>
      <NameTag text={flight.tail} position={[0, 3.8, 0]} width={1.3} maxDistance={45} />
    </group>
  )
}

export default function Flights() {
  return (
    <>
      {FLIGHTS.map((f) => (
        <FlightActor key={f.id} flight={f} />
      ))}
    </>
  )
}
