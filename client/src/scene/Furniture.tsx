import type { FurnitureItem } from '../city/interiors'

// Simple box/cylinder furniture. Each piece sits on y=0 in room space.

function Bed({ color = '#b3564d' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.9, 0.5, 2.9]} />
        <meshStandardMaterial color="#8a6a4a" />
      </mesh>
      <mesh position={[0, 0.55, 0.25]}>
        <boxGeometry args={[1.7, 0.25, 2.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.58, -1.05]}>
        <boxGeometry args={[1.7, 0.22, 0.6]} />
        <meshStandardMaterial color="#f2ede2" />
      </mesh>
      <mesh position={[0, 0.7, -1.4]}>
        <boxGeometry args={[1.9, 0.9, 0.12]} />
        <meshStandardMaterial color="#6b4a2f" />
      </mesh>
    </group>
  )
}

function Table() {
  return (
    <group>
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[1.5, 0.07, 1]} />
        <meshStandardMaterial color="#8a6a4a" />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 0.72, 8]} />
        <meshStandardMaterial color="#6b4a2f" />
      </mesh>
    </group>
  )
}

function Chair({ color = '#7a5a3a' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.5, 0.07, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.45, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.8, -0.22]}>
        <boxGeometry args={[0.5, 0.65, 0.07]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

function Stool({ color = '#c0392b' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 0.66, 8]} />
        <meshStandardMaterial color="#9a9aa0" />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.1, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

function Sofa({ color = '#4a5a78' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2, 0.55, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.7, -0.35]}>
        <boxGeometry args={[2, 0.75, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]}>
          <boxGeometry args={[0.2, 0.5, 0.9]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function Bench({ color = '#b3564d' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, 0.55]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.65, -0.2]}>
        <boxGeometry args={[1.5, 0.6, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

function Rug({ color = '#b3564d', size = 1.5 }: { color?: string; size?: number }) {
  return (
    <mesh position={[0, 0.015, 0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[size, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Counter({ color = '#8a8f96', size = 3 }: { color?: string; size?: number }) {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[size, 0.9, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.93, 0]}>
        <boxGeometry args={[size + 0.1, 0.06, 0.7]} />
        <meshStandardMaterial color="#e8e4da" />
      </mesh>
    </group>
  )
}

function Fridge() {
  return (
    <group>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.8, 1.9, 0.7]} />
        <meshStandardMaterial color="#dfe3e6" />
      </mesh>
      <mesh position={[0.32, 1.2, 0.36]}>
        <boxGeometry args={[0.06, 0.5, 0.05]} />
        <meshStandardMaterial color="#9aa0a6" />
      </mesh>
    </group>
  )
}

function Stove() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.8, 0.9, 0.65]} />
        <meshStandardMaterial color="#c9ccd1" />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[0.75, 0.04, 0.6]} />
        <meshStandardMaterial color="#2b2b30" />
      </mesh>
    </group>
  )
}

const GOODS_COLORS = ['#c0392b', '#2d6cdf', '#e0a020', '#00885a', '#6c5ce7', '#d8d8d8']

function Shelf({ size = 4 }: { size?: number }) {
  const goods: { x: number; y: number; c: string }[] = []
  const perRow = Math.floor(size / 0.55)
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < perRow; i++) {
      if ((row * 7 + i * 3) % 5 === 4) continue // gaps so shelves don't look cloned
      goods.push({
        x: -size / 2 + 0.4 + i * 0.55,
        y: 0.42 + row * 0.45,
        c: GOODS_COLORS[(row * 5 + i * 2) % GOODS_COLORS.length],
      })
    }
  }
  return (
    <group>
      {[-size / 2, size / 2].map((x) => (
        <mesh key={x} position={[x, 0.7, 0]}>
          <boxGeometry args={[0.06, 1.4, 0.45]} />
          <meshStandardMaterial color="#7d858d" />
        </mesh>
      ))}
      {[0.35, 0.8, 1.25].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[size, 0.05, 0.45]} />
          <meshStandardMaterial color="#9aa0a6" />
        </mesh>
      ))}
      {goods.map((g, i) => (
        <mesh key={i} position={[g.x, g.y + 0.12, 0]}>
          <boxGeometry args={[0.28, 0.24, 0.24]} />
          <meshStandardMaterial color={g.c} />
        </mesh>
      ))}
    </group>
  )
}

function Plant() {
  return (
    <group>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.44, 10]} />
        <meshStandardMaterial color="#a05a3c" />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.4, 9, 7]} />
        <meshStandardMaterial color="#4a7c3f" flatShading />
      </mesh>
    </group>
  )
}

function Lamp() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.04, 0.14, 1.4, 8]} />
        <meshStandardMaterial color="#3a3f45" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[0.3, 0.35, 12, 1, true]} />
        <meshStandardMaterial color="#f2e2b8" emissive="#ffe9a0" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function Tv() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.6, 0.5, 0.4]} />
        <meshStandardMaterial color="#6b4a2f" />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.4, 0.8, 0.08]} />
        <meshStandardMaterial color="#15161a" emissive="#1e2a3a" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

function Desk({ color = '#4a5a78', size = 4 }: { color?: string; size?: number }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[size, 1, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <boxGeometry args={[size + 0.15, 0.07, 0.95]} />
        <meshStandardMaterial color="#e8e4da" />
      </mesh>
    </group>
  )
}

function Elevator() {
  return (
    <group>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.5, 2.5, 0.15]} />
        <meshStandardMaterial color="#7d858d" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.25, 0.05]}>
        <boxGeometry args={[0.05, 2.3, 0.12]} />
        <meshStandardMaterial color="#3a3f45" />
      </mesh>
    </group>
  )
}

export function Furniture({ item }: { item: FurnitureItem }) {
  const inner = (() => {
    switch (item.type) {
      case 'bed': return <Bed color={item.color} />
      case 'table': return <Table />
      case 'chair': return <Chair color={item.color} />
      case 'stool': return <Stool color={item.color} />
      case 'sofa': return <Sofa color={item.color} />
      case 'bench': return <Bench color={item.color} />
      case 'rug': return <Rug color={item.color} size={item.size} />
      case 'counter': return <Counter color={item.color} size={item.size} />
      case 'fridge': return <Fridge />
      case 'stove': return <Stove />
      case 'shelf': return <Shelf size={item.size} />
      case 'plant': return <Plant />
      case 'lamp': return <Lamp />
      case 'tv': return <Tv />
      case 'desk': return <Desk color={item.color} size={item.size} />
      case 'elevator': return <Elevator />
    }
  })()
  return (
    <group position={[item.position[0], 0, item.position[1]]} rotation-y={item.rotation ?? 0}>
      {inner}
    </group>
  )
}
