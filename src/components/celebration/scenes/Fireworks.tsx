import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import FocusBuddy from '../buddy/FocusBuddy'

const BURST_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#60a5fa']
const PARTICLES_PER_BURST = 60

interface Burst {
  active: boolean
  origin: [number, number, number]
  color: string
  startTime: number
  velocities: Float32Array
}

function FireworkSystem() {
  const pointsRef = useRef<THREE.Points>(null)
  const [bursts] = useState<Burst[]>(() =>
    Array.from({ length: 5 }, () => ({
      active: false,
      origin: [0, 0, 0] as [number, number, number],
      color: BURST_COLORS[0],
      startTime: 0,
      velocities: new Float32Array(PARTICLES_PER_BURST * 3),
    }))
  )

  const positions = useMemo(
    () => new Float32Array(5 * PARTICLES_PER_BURST * 3),
    []
  )

  const nextBurstRef = useRef(0)
  const lastLaunchRef = useRef(0)

  useFrame(() => {
    const t = performance.now() / 1000

    // Launch a new burst every ~1.8 seconds
    if (t - lastLaunchRef.current > 1.8) {
      lastLaunchRef.current = t
      const idx = nextBurstRef.current % 5
      nextBurstRef.current++
      const burst = bursts[idx]
      burst.active = true
      burst.origin = [
        (Math.random() - 0.5) * 4,
        1 + Math.random() * 2,
        (Math.random() - 0.5) * 2,
      ]
      burst.color = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)]
      burst.startTime = t

      // Random velocities in a sphere
      for (let i = 0; i < PARTICLES_PER_BURST; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const speed = 1 + Math.random() * 2
        burst.velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
        burst.velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed
        burst.velocities[i * 3 + 2] = Math.cos(phi) * speed
      }
    }

    // Update all particles
    for (let b = 0; b < 5; b++) {
      const burst = bursts[b]
      const offset = b * PARTICLES_PER_BURST * 3
      const age = t - burst.startTime

      if (!burst.active || age > 2.5) {
        // Hide particles
        for (let i = 0; i < PARTICLES_PER_BURST * 3; i++) {
          positions[offset + i] = 0
        }
        if (age > 2.5) burst.active = false
        continue
      }

      for (let i = 0; i < PARTICLES_PER_BURST; i++) {
        const pi = offset + i * 3
        positions[pi] = burst.origin[0] + burst.velocities[i * 3] * age * 0.5
        positions[pi + 1] = burst.origin[1] + burst.velocities[i * 3 + 1] * age * 0.5 - 0.5 * age * age * 0.4
        positions[pi + 2] = burst.origin[2] + burst.velocities[i * 3 + 2] * age * 0.5
      }
    }

    if (pointsRef.current) {
      const geom = pointsRef.current.geometry
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geom.attributes.position.needsUpdate = true
    }
  })

  // Use the color of the most recent active burst
  const activeColor = bursts.find((b) => b.active)?.color ?? '#fbbf24'

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.06}
        color={activeColor}
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function Fireworks() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#fde68a" />

      <Stars radius={50} depth={30} count={800} factor={2} saturation={0} fade speed={0.5} />

      <group position={[0, -1.5, 0]}>
        <FocusBuddy animation="lookUp" hatType="star" />
      </group>

      <FireworkSystem />
    </>
  )
}
