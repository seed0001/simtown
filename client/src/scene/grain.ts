import * as THREE from 'three'

// Procedural monochrome grain, generated once and shared by every material
// that wants surface tooth. In a colorless world the fine relief is what
// separates plaster from asphalt from paper — bump-mapped noise catches the
// directional light the way pencil grain catches a graphite stroke.
//
// One 512px noise canvas backs every texture; variants differ only in how
// many times they tile across a surface, and are cached by repeat count.

let noise: HTMLCanvasElement | null = null

function noiseCanvas(): HTMLCanvasElement {
  if (noise) return noise
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    // mid-gray with a tight scatter: visible relief, never speckle
    const v = 128 + (Math.random() - 0.5) * 96
    d[i] = d[i + 1] = d[i + 2] = v
    d[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  noise = canvas
  return canvas
}

const cache = new Map<string, THREE.CanvasTexture>()

/**
 * Shared grain texture tiled `rx` by `ry` times across the surface. Pick the
 * repeat so a texel lands around a centimetre of world space: ~4 for a house
 * wall, ~40 along a full street.
 */
export function grainTexture(rx = 4, ry = rx): THREE.CanvasTexture {
  const key = `${rx}:${ry}`
  const hit = cache.get(key)
  if (hit) return hit
  const tex = new THREE.CanvasTexture(noiseCanvas())
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(rx, ry)
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

/** How strongly grained surfaces relieve. One knob for the whole town. */
export const GRAIN_BUMP = 0.02
