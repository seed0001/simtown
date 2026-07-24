import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import type { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'

const EYE_HEIGHT = 1.7
const WALK_SPEED = 7
const SPRINT_MULT = 1.9

export interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export default function Player({
  onLockChange,
  bounds,
}: {
  onLockChange: (locked: boolean) => void
  bounds: Bounds
}) {
  const controlsRef = useRef<PointerLockControlsImpl>(null)
  const keys = useRef<Set<string>>(new Set())
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.code)
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const blur = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls || !controls.isLocked) return
    const k = keys.current
    const dt = Math.min(delta, 0.1)
    const sprint = k.has('ShiftLeft') || k.has('ShiftRight') ? SPRINT_MULT : 1
    const speed = WALK_SPEED * sprint * dt

    let forward = 0
    let right = 0
    if (k.has('KeyW') || k.has('ArrowUp')) forward += 1
    if (k.has('KeyS') || k.has('ArrowDown')) forward -= 1
    if (k.has('KeyD') || k.has('ArrowRight')) right += 1
    if (k.has('KeyA') || k.has('ArrowLeft')) right -= 1

    if (forward !== 0 || right !== 0) {
      const norm = forward !== 0 && right !== 0 ? Math.SQRT1_2 : 1
      controls.moveForward(forward * speed * norm)
      controls.moveRight(right * speed * norm)
    }

    // stay on the ground and inside the current map's bounds
    camera.position.y = EYE_HEIGHT
    camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x))
    camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z))
  })

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  )
}
