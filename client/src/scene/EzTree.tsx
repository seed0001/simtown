import { useMemo } from 'react'
import { Tree, TreePreset } from '@dgreenheck/ez-tree'

// Every real preset ez-tree ships, in the order we cycle through them.
// 'Trellis' is a climbing-plant support structure, not a standalone tree, so
// it's excluded from the rotation.
export const TREE_PRESETS = Object.keys(TreePreset).filter((name) => name !== 'Trellis')

/**
 * One procedurally-generated tree. `seed` re-generates the preset's shape
 * (branch layout, leaf scatter) so two trees using the same preset don't come
 * out as identical clones — same idea as the mountains' seeded variation.
 * No texture maps are supplied, so bark and leaves render as flat-tinted
 * geometry off the preset's own tint values, matching the rest of the
 * town's flat-shaded, untextured look.
 */
export function EzTree({
  preset,
  seed,
  position,
  scale = 1,
}: {
  preset: string
  seed: number
  position: [number, number, number]
  scale?: number
}) {
  const tree = useMemo(() => {
    const t = new Tree()
    t.loadPreset(preset)
    t.options.seed = seed
    t.generate()
    return t
  }, [preset, seed])

  return <primitive object={tree} position={position} scale={scale} />
}
