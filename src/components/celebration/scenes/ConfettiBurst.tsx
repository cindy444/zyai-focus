import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import FocusBuddy from '../buddy/FocusBuddy'

const CONFETTI_COUNT = 200
const COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#a78bfa']

function ConfettiSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: CONFETTI_COUNT }, () => ({
      x: (Math.random() - 0.5) * 6,
      y: 4 + Math.random() * 4,
      z: (Math.random() - 0.5) * 3,
      vy: -(0.5 + Math.random() * 1.5),
      vx: (Math.random() - 0.5) * 0.5,
      rotSpeed: (Math.random() - 0.5) * 5,
      rotAxis: Math.floor(Math.random() * 3),
      colorIdx: Math.floor(Math.random() * COLORS.length),
    }))
  }, [])

  // Set initial colors
  useMemo(() => {
    if (!meshRef.current) return
    const color = new THREE.Color()
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      color.set(COLORS[particles[i].colorIdx])
      meshRef.current.setColorAt(i, color)
    }
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [particles])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const p = particles[i]
      p.y += p.vy * delta
      p.x += p.vx * delta

      // Reset when off screen
      if (p.y < -3) {
        p.y = 4 + Math.random() * 2
        p.x = (Math.random() - 0.5) * 6
      }

      dummy.position.set(p.x, p.y, p.z)
      const rot = performance.now() / 1000 * p.rotSpeed
      if (p.rotAxis === 0) dummy.rotation.set(rot, 0, 0)
      else if (p.rotAxis === 1) dummy.rotation.set(0, rot, 0)
      else dummy.rotation.set(0, 0, rot)
      dummy.scale.set(0.06, 0.1, 0.005)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true

    // Set colors on first frame
    if (meshRef.current.instanceColor === null) {
      const color = new THREE.Color()
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        color.set(COLORS[particles[i].colorIdx])
        meshRef.current.setColorAt(i, color)
      }
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CONFETTI_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial toneMapped={false} />
    </instancedMesh>
  )
}

export default function ConfettiBurst() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight position={[0, 3, 3]} intensity={2} color="#fde68a" />
      <pointLight position={[-2, 1, 2]} intensity={1} color="#818cf8" />
      <pointLight position={[2, 1, 2]} intensity={1} color="#f472b6" />

      <group position={[0, -1, 0]}>
        <FocusBuddy animation="jump" hatType="party" />
      </group>

      <ConfettiSystem />

      <Sparkles count={60} scale={5} size={3} speed={0.5} color="#fbbf24" opacity={0.7} />
    </>
  )
}
