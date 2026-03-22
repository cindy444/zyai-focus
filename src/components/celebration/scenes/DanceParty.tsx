import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import FocusBuddy from '../buddy/FocusBuddy'

const SPOT_COLORS = ['#818cf8', '#a855f7', '#ec4899', '#f59e0b'] as const

function DiscoSphere() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.008
      ref.current.rotation.x += 0.003
    }
  })

  return (
    <mesh ref={ref} position={[0, 2.2, 0]}>
      <icosahedronGeometry args={[0.35, 1]} />
      <meshStandardMaterial
        color="#e2e8f0"
        metalness={0.95}
        roughness={0.05}
        emissive="#94a3b8"
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

function SweepingLights() {
  const lightsRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!lightsRef.current) return
    const t = performance.now() / 1000
    lightsRef.current.children.forEach((child, i) => {
      const spot = child as THREE.SpotLight
      const angle = t * (0.8 + i * 0.2) + (i * Math.PI) / 2
      spot.target.position.set(Math.sin(angle) * 3, -1, Math.cos(angle) * 2)
      spot.target.updateMatrixWorld()
    })
  })

  return (
    <group ref={lightsRef}>
      {SPOT_COLORS.map((color, i) => (
        <spotLight
          key={i}
          position={[(i - 1.5) * 1.5, 3.5, 1]}
          color={color}
          intensity={3}
          angle={0.4}
          penumbra={0.8}
          distance={8}
          target-position={[0, -1, 0]}
        />
      ))}
    </group>
  )
}

export default function DanceParty() {
  return (
    <>
      <ambientLight intensity={0.35} />

      <SweepingLights />

      <DiscoSphere />

      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <group position={[0, -1, 0]}>
          <FocusBuddy animation="dance" hatType="halo" />
        </group>
      </Float>

      {/* Floor reflection hint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>

      <Sparkles count={50} scale={6} size={2} speed={0.3} color="#a855f7" opacity={0.5} />
    </>
  )
}
