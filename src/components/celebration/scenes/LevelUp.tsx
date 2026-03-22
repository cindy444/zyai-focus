import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import FocusBuddy from '../buddy/FocusBuddy'

const STEP_COUNT = 6
const STEP_WIDTH = 0.8
const STEP_HEIGHT = 0.35
const STEP_DEPTH = 0.4

const STEP_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff']

function Staircase({ litUpTo }: { litUpTo: number }) {
  return (
    <group position={[-1.5, -1.8, 0]}>
      {Array.from({ length: STEP_COUNT }, (_, i) => {
        const isLit = i <= litUpTo
        return (
          <mesh
            key={i}
            position={[i * 0.55, i * STEP_HEIGHT, 0]}
          >
            <boxGeometry args={[STEP_WIDTH, STEP_HEIGHT * 0.8, STEP_DEPTH]} />
            <meshStandardMaterial
              color={STEP_COLORS[i]}
              emissive={isLit ? STEP_COLORS[i] : '#000000'}
              emissiveIntensity={isLit ? 0.6 : 0}
              transparent
              opacity={isLit ? 1 : 0.4}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function GoalStar() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.02
      ref.current.rotation.z += 0.01
      ref.current.position.y = -1.8 + (STEP_COUNT - 1) * STEP_HEIGHT + 0.7 + Math.sin(performance.now() / 500) * 0.05
    }
  })

  const goalX = -1.5 + (STEP_COUNT - 1) * 0.55

  return (
    <mesh ref={ref} position={[goalX, -1.8 + (STEP_COUNT - 1) * STEP_HEIGHT + 0.7, 0]}>
      <octahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#fbbf24"
        emissiveIntensity={1}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function LevelUp() {
  const buddyRef = useRef<THREE.Group>(null)
  const currentStepRef = useRef(0)

  // Particles floating upward
  const trailRef = useRef<THREE.Points>(null)
  const trailPositions = useMemo(() => new Float32Array(150), [])

  useFrame(() => {
    const t = performance.now() / 1000
    // The buddy climbs one step every ~1.3 seconds
    const step = Math.min(Math.floor((t % 8) / 1.3), STEP_COUNT - 1)
    currentStepRef.current = step

    if (buddyRef.current) {
      const targetX = -1.5 + step * 0.55
      const targetY = -1.8 + step * STEP_HEIGHT + STEP_HEIGHT * 0.5 + 0.35
      // Smooth lerp
      buddyRef.current.position.x += (targetX - buddyRef.current.position.x) * 0.08
      buddyRef.current.position.y += (targetY - buddyRef.current.position.y) * 0.08
    }

    // Trail particles rising from buddy
    if (trailRef.current && buddyRef.current) {
      for (let i = 0; i < 50; i++) {
        const idx = i * 3
        trailPositions[idx] += (Math.random() - 0.5) * 0.01
        trailPositions[idx + 1] += 0.015
        if (trailPositions[idx + 1] > 3 || trailPositions[idx + 1] === 0) {
          trailPositions[idx] = buddyRef.current.position.x + (Math.random() - 0.5) * 0.4
          trailPositions[idx + 1] = buddyRef.current.position.y + Math.random() * 0.3
          trailPositions[idx + 2] = (Math.random() - 0.5) * 0.3
        }
      }
      const geom = trailRef.current.geometry
      geom.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3))
      geom.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[1, 3, 3]} intensity={2} color="#fde68a" />
      <pointLight position={[-1, 0, 2]} intensity={1} color="#818cf8" />

      <Staircase litUpTo={currentStepRef.current} />
      <GoalStar />

      <group ref={buddyRef} position={[-1.5, -1, 0]} scale={0.7}>
        <FocusBuddy animation="climb" hatType="star" />
      </group>

      {/* Rising particles */}
      <points ref={trailRef}>
        <bufferGeometry />
        <pointsMaterial
          size={0.04}
          color="#a5b4fc"
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <Sparkles count={30} scale={4} size={1.5} speed={0.3} color="#fbbf24" opacity={0.4} />
    </>
  )
}
