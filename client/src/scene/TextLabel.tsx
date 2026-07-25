import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Text rendered onto a canvas texture — no font files or network needed.
function useTextTexture(text: string, bg: string, fg: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 512, 128)
    ctx.strokeStyle = fg
    ctx.lineWidth = 6
    ctx.strokeRect(8, 8, 496, 112)
    ctx.fillStyle = fg
    ctx.font = 'bold 68px system-ui, Segoe UI, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.toUpperCase(), 256, 70, 460)
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    return texture
  }, [text, bg, fg])
}

/** A flat sign plate with text, readable from both sides. */
export function SignPlate({
  text,
  position,
  rotation = 0,
  width = 3,
  height = 0.75,
  bg = '#1e6b3a',
  fg = '#ffffff',
}: {
  text: string
  position: [number, number, number]
  rotation?: number
  width?: number
  height?: number
  bg?: string
  fg?: string
}) {
  const texture = useTextTexture(text, bg, fg)
  return (
    <group position={position} rotation-y={rotation}>
      {[0, Math.PI].map((flip) => (
        <mesh key={flip} rotation-y={flip} position-z={flip === 0 ? 0.012 : -0.012}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Green street-name signs crossed on a pole, placed at intersections. */
export function StreetSignPost({
  position,
  ewName,
  nsName,
}: {
  position: [number, number, number]
  ewName: string
  nsName: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 3.5, 8]} />
        <meshStandardMaterial color="#3a3f45" />
      </mesh>
      {/* east-west street name faces north/south */}
      <SignPlate text={ewName} position={[0, 3.3, 0]} rotation={0} width={2.6} height={0.55} />
      {/* north-south street name faces east/west */}
      <SignPlate text={nsName} position={[0, 2.65, 0]} rotation={Math.PI / 2} width={2.6} height={0.55} />
    </group>
  )
}

// Rounded pill on a transparent canvas, for labels that float over a person.
function useNameTexture(text: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 512, 128)

    const box = () => {
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') ctx.roundRect(8, 28, 496, 72, 36)
      else ctx.rect(8, 28, 496, 72)
    }
    ctx.fillStyle = 'rgba(10, 10, 20, 0.62)'
    box()
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)'
    ctx.lineWidth = 3
    box()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = '600 44px system-ui, Segoe UI, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 256, 65, 440)

    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    return texture
  }, [text])
}

const TAG_WORLD_POS = new THREE.Vector3()

/**
 * A name that floats over a resident, turns to face the camera, and hides
 * past `maxDistance` so the skyline doesn't fill with labels. Mount it under a
 * group that carries position but no rotation — it copies the camera's
 * orientation directly, so a rotated parent would skew it.
 */
export function NameTag({
  text,
  position,
  maxDistance = 18,
  width = 1.5,
}: {
  text: string
  position: [number, number, number]
  maxDistance?: number
  width?: number
}) {
  const ref = useRef<THREE.Group>(null)
  const texture = useNameTexture(text)

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    g.getWorldPosition(TAG_WORLD_POS)
    const visible = state.camera.position.distanceTo(TAG_WORLD_POS) < maxDistance
    g.visible = visible
    if (visible) g.quaternion.copy(state.camera.quaternion)
  })

  return (
    <group ref={ref} position={position}>
      <mesh>
        <planeGeometry args={[width, width / 4]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Small white address plate mounted above a building's door. */
export function AddressPlate({
  number,
  position,
  rotation,
}: {
  number: number
  position: [number, number, number]
  rotation: number
}) {
  return (
    <SignPlate
      text={String(number)}
      position={position}
      rotation={rotation}
      width={0.85}
      height={0.4}
      bg="#f5f2ea"
      fg="#2b2b30"
    />
  )
}
