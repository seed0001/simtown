import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Aircraft built from the same primitives as the buildings and the residents.
// Both models face +z in local space, nose forward, matching everything else
// that gets a heading.

/** A high-wing single, the kind that actually uses a strip this short. */
export function SmallPlane({ livery, accent }: { livery: string; accent: string }) {
  const prop = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (prop.current) prop.current.rotation.z += delta * 34
  })

  return (
    <group>
      {/* fuselage */}
      <mesh position={[0, 0.95, 0.1]} castShadow>
        <boxGeometry args={[0.86, 0.9, 5.4]} />
        <meshStandardMaterial color={livery} />
      </mesh>
      {/* nose taper */}
      <mesh position={[0, 0.95, 2.95]} castShadow>
        <boxGeometry args={[0.66, 0.7, 0.7]} />
        <meshStandardMaterial color={livery} />
      </mesh>
      {/* cabin glass */}
      <mesh position={[0, 1.3, 1.15]}>
        <boxGeometry args={[0.8, 0.42, 1.5]} />
        <meshStandardMaterial color="#2a3442" metalness={0.2} roughness={0.35} />
      </mesh>
      {/* stripe down the side */}
      <mesh position={[0, 0.72, 0.1]}>
        <boxGeometry args={[0.88, 0.16, 5.0]} />
        <meshStandardMaterial color={accent} />
      </mesh>

      {/* high wing */}
      <mesh position={[0, 1.52, 0.85]} castShadow>
        <boxGeometry args={[10.4, 0.16, 1.5]} />
        <meshStandardMaterial color={livery} />
      </mesh>
      {/* wing struts */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.6, 1.16, 0.85]} rotation-z={s * 0.5} castShadow>
          <boxGeometry args={[0.1, 0.86, 0.14]} />
          <meshStandardMaterial color="#b8bcc2" />
        </mesh>
      ))}
      {/* wingtip lights */}
      {[
        { x: -5.1, c: '#d64545' },
        { x: 5.1, c: '#49c07a' },
      ].map((tip) => (
        <mesh key={tip.x} position={[tip.x, 1.52, 1.1]}>
          <boxGeometry args={[0.18, 0.14, 0.18]} />
          <meshStandardMaterial color={tip.c} emissive={tip.c} emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* tailplane + fin */}
      <mesh position={[0, 1.12, -2.45]} castShadow>
        <boxGeometry args={[3.5, 0.13, 0.85]} />
        <meshStandardMaterial color={livery} />
      </mesh>
      <mesh position={[0, 1.72, -2.55]} castShadow>
        <boxGeometry args={[0.12, 1.5, 1.1]} />
        <meshStandardMaterial color={accent} />
      </mesh>

      {/* propeller */}
      <group ref={prop} position={[0, 0.95, 3.34]}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 3.1, 0.06]} />
          <meshStandardMaterial color="#2f3338" />
        </mesh>
        <mesh>
          <boxGeometry args={[3.1, 0.16, 0.06]} />
          <meshStandardMaterial color="#2f3338" />
        </mesh>
      </group>
      <mesh position={[0, 0.95, 3.24]}>
        <sphereGeometry args={[0.19, 10, 8]} />
        <meshStandardMaterial color={accent} />
      </mesh>

      {/* fixed gear: nose + two mains */}
      {[
        [0, 2.5],
        [-1.15, 0.35],
        [1.15, 0.35],
      ].map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.68, 6]} />
            <meshStandardMaterial color="#8d9298" />
          </mesh>
          <mesh position={[0, 0.22, 0]} rotation-z={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.14, 10]} />
            <meshStandardMaterial color="#26282c" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** A light two-seat helicopter on skids. */
export function Helicopter({ livery, accent }: { livery: string; accent: string }) {
  const mainRotor = useRef<THREE.Group>(null)
  const tailRotor = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (mainRotor.current) mainRotor.current.rotation.y += delta * 20
    if (tailRotor.current) tailRotor.current.rotation.z += delta * 30
  })

  return (
    <group>
      {/* cabin */}
      <mesh position={[0, 1.35, 0.5]} castShadow>
        <sphereGeometry args={[1.15, 12, 10]} />
        <meshStandardMaterial color={livery} />
      </mesh>
      {/* bubble canopy */}
      <mesh position={[0, 1.4, 1.25]}>
        <sphereGeometry args={[0.86, 12, 10]} />
        <meshStandardMaterial color="#2a3442" metalness={0.2} roughness={0.3} />
      </mesh>
      {/* tail boom */}
      <mesh position={[0, 1.5, -1.9]} castShadow>
        <boxGeometry args={[0.28, 0.28, 3.6]} />
        <meshStandardMaterial color={livery} />
      </mesh>
      <mesh position={[0, 1.5, -3.5]} castShadow>
        <boxGeometry args={[0.16, 0.95, 0.6]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      {/* tail stabiliser */}
      <mesh position={[0, 1.5, -3.1]} castShadow>
        <boxGeometry args={[1.5, 0.1, 0.42]} />
        <meshStandardMaterial color={livery} />
      </mesh>

      {/* mast + main rotor */}
      <mesh position={[0, 2.36, 0.4]}>
        <cylinderGeometry args={[0.1, 0.12, 0.6, 8]} />
        <meshStandardMaterial color="#8d9298" />
      </mesh>
      <group ref={mainRotor} position={[0, 2.66, 0.4]}>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation-y={r} castShadow>
            <boxGeometry args={[9.2, 0.08, 0.42]} />
            <meshStandardMaterial color="#33383e" />
          </mesh>
        ))}
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.16, 8]} />
          <meshStandardMaterial color={accent} />
        </mesh>
      </group>

      {/* tail rotor */}
      <group ref={tailRotor} position={[0.2, 1.5, -3.5]}>
        <mesh rotation-y={Math.PI / 2}>
          <boxGeometry args={[0.06, 1.5, 0.16]} />
          <meshStandardMaterial color="#33383e" />
        </mesh>
      </group>

      {/* skids */}
      {[-0.85, 0.85].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.13, 0.4]} castShadow>
            <boxGeometry args={[0.13, 0.13, 3.1]} />
            <meshStandardMaterial color="#8d9298" />
          </mesh>
          {[-0.55, 1.35].map((z) => (
            <mesh key={z} position={[x, 0.58, z]} rotation-x={0.15}>
              <boxGeometry args={[0.1, 0.9, 0.1]} />
              <meshStandardMaterial color="#8d9298" />
            </mesh>
          ))}
        </group>
      ))}
      {/* beacon */}
      <mesh position={[0, 2.3, -0.4]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshStandardMaterial color="#d64545" emissive="#d64545" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}
