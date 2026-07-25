import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Appearance } from '../city/residents'

// A body built from the same boxes and cylinders as the furniture, so people
// read as part of the same world. The mesh stands on y=0 and faces +z, matching
// every other placed object in the scene.

const HEAD_R = 0.145
const TORSO_H = 0.62
const LEG_H = 0.84
const ARM_H = 0.58
const HIP_Y = LEG_H
const SHOULDER_Y = HIP_Y + TORSO_H

function Hair({ style, color, r }: { style: Appearance['hairStyle']; color: string; r: number }) {
  switch (style) {
    case 'bald':
      return null
    case 'thin':
      return (
        <mesh position={[0, r * 0.42, -r * 0.06]} castShadow>
          <sphereGeometry args={[r * 1.02, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      )
    case 'bun':
      return (
        <group>
          <mesh position={[0, r * 0.3, 0]} castShadow>
            <sphereGeometry args={[r * 1.08, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0, r * 0.55, -r * 1.0]} castShadow>
            <sphereGeometry args={[r * 0.55, 9, 7]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </group>
      )
    case 'long':
      return (
        <group>
          <mesh position={[0, r * 0.28, 0]} castShadow>
            <sphereGeometry args={[r * 1.08, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          {/* fall down the back of the neck */}
          <mesh position={[0, -r * 0.62, -r * 0.5]} castShadow>
            <boxGeometry args={[r * 1.7, r * 2.1, r * 0.9]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </group>
      )
    case 'short':
    default:
      return (
        <mesh position={[0, r * 0.26, -r * 0.04]} castShadow>
          <sphereGeometry args={[r * 1.07, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      )
  }
}

/**
 * A resident's body. `walking` swings the arms and legs; when false the figure
 * breathes in place so nobody reads as a mannequin. `phase` offsets the
 * animation per person so a crowd doesn't move in lockstep.
 */
export default function Person({
  appearance: a,
  walking = false,
  phase = 0,
}: {
  appearance: Appearance
  walking?: boolean
  phase?: number
}) {
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase
    if (walking) {
      const swing = Math.sin(t * 6.5) * 0.55
      if (leftLeg.current) leftLeg.current.rotation.x = swing
      if (rightLeg.current) rightLeg.current.rotation.x = -swing
      if (leftArm.current) leftArm.current.rotation.x = -swing * 0.7
      if (rightArm.current) rightArm.current.rotation.x = swing * 0.7
      // slight bob in time with the stride
      if (body.current) body.current.position.y = Math.abs(Math.sin(t * 6.5)) * 0.045
    } else {
      const idle = Math.sin(t * 1.6) * 0.05
      if (leftLeg.current) leftLeg.current.rotation.x = 0
      if (rightLeg.current) rightLeg.current.rotation.x = 0
      if (leftArm.current) leftArm.current.rotation.x = idle
      if (rightArm.current) rightArm.current.rotation.x = -idle
      if (body.current) body.current.position.y = Math.sin(t * 1.6) * 0.012
    }
  })

  const shoulderX = 0.17 * a.build
  const torsoW = 0.36 * a.build

  return (
    <group scale={a.height}>
      <group ref={body}>
        {/* legs hinge at the hip */}
        {[
          { ref: leftLeg, x: -0.09 },
          { ref: rightLeg, x: 0.09 },
        ].map((leg, i) => (
          <group key={i} ref={leg.ref} position={[leg.x, HIP_Y, 0]}>
            <mesh position={[0, -LEG_H / 2, 0]} castShadow>
              <boxGeometry args={[0.14, LEG_H, 0.15]} />
              <meshStandardMaterial color={a.pants} />
            </mesh>
            <mesh position={[0, -LEG_H + 0.03, 0.03]} castShadow>
              <boxGeometry args={[0.155, 0.09, 0.24]} />
              <meshStandardMaterial color={a.shoes} />
            </mesh>
          </group>
        ))}

        {/* torso */}
        <mesh position={[0, HIP_Y + TORSO_H / 2, 0]} castShadow>
          <boxGeometry args={[torsoW, TORSO_H, 0.21]} />
          <meshStandardMaterial color={a.shirt} />
        </mesh>

        {/* arms hinge at the shoulder */}
        {[
          { ref: leftArm, x: -(shoulderX + 0.045) },
          { ref: rightArm, x: shoulderX + 0.045 },
        ].map((arm, i) => (
          <group key={i} ref={arm.ref} position={[arm.x, SHOULDER_Y - 0.05, 0]}>
            <mesh position={[0, -ARM_H / 2, 0]} castShadow>
              <boxGeometry args={[0.1, ARM_H, 0.11]} />
              <meshStandardMaterial color={a.shirt} />
            </mesh>
            {/* hand */}
            <mesh position={[0, -ARM_H - 0.02, 0]} castShadow>
              <boxGeometry args={[0.1, 0.12, 0.11]} />
              <meshStandardMaterial color={a.skin} />
            </mesh>
          </group>
        ))}

        {/* neck + head */}
        <mesh position={[0, SHOULDER_Y + 0.03, 0]}>
          <cylinderGeometry args={[0.058, 0.064, 0.09, 8]} />
          <meshStandardMaterial color={a.skin} />
        </mesh>
        <group position={[0, SHOULDER_Y + 0.07 + HEAD_R, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[HEAD_R, 12, 10]} />
            <meshStandardMaterial color={a.skin} />
          </mesh>
          <Hair style={a.hairStyle} color={a.hair} r={HEAD_R} />
        </group>
      </group>
    </group>
  )
}
