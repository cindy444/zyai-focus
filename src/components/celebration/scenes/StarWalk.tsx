import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import FocusBuddy from '../buddy/FocusBuddy'

export default function StarWalk() {
  const buddyGroupRef = useRef<THREE.Group>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const particlesRef = useRef<{ positions: Float32Array; ages: number[] }>({
    positions: new Float32Array(300), // 100 particles * 3
    ages: new Array(100).fill(-1),
  })
  const pointsRef = useRef<THREE.Points>(null)

  useFrame((_, delta) => {
    if (!buddyGroupRef.current) return

    // Move buddy from left to right over 8 seconds
    const t = performance.now() / 1000
    const x = -3 + ((t % 8) / 8) * 6
    buddyGroupRef.current.position.x = x
    buddyGroupRef.current.position.y = -0.5

    // Follow light
    if (lightRef.current) {
      lightRef.current.position.set(x, 1, 2)
    }

    // Emit trail particles
    const p = particlesRef.current
    if (pointsRef.current) {
      for (let i = 0; i < 100; i++) {
        if (p.ages[i] < 0 && Math.random() < 0.3) {
          // Spawn new particle at buddy position
          p.positions[i * 3] = x + (Math.random() - 0.5) * 0.3
          p.positions[i * 3 + 1] = -0.3 + Math.random() * 0.8
          p.positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5
          p.ages[i] = 0
          break
        }
      }
      for (let i = 0; i < 100; i++) {
        if (p.ages[i] >= 0) {
          p.ages[i] += delta
          p.positions[i * 3 + 1] += delta * 0.3 // float up
          if (p.ages[i] > 1.5) {
            p.ages[i] = -1
            p.positions[i * 3 + 1] = -10 // hide
          }
        }
      }
      const geom = pointsRef.current.geometry
      geom.setAttribute('position', new THREE.Float32BufferAttribute(p.positions, 3))
      geom.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight ref={lightRef} intensity={1.5} distance={5} color="#fde68a" />
      <Stars radius={50} depth={30} count={1500} factor={3} saturation={0.5} fade speed={1} />

      <group ref={buddyGroupRef}>
        <FocusBuddy animation="walk" hatType="star" />
      </group>

      {/* Star trail particles */}
      <points ref={pointsRef}>
        <bufferGeometry />
        <pointsMaterial size={0.08} color="#fde68a" transparent opacity={0.8} sizeAttenuation />
      </points>

      <Sparkles count={40} scale={6} size={2} speed={0.4} color="#fde68a" opacity={0.5} />
    </>
  )
}
