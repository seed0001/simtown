import { useMemo } from 'react'
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
