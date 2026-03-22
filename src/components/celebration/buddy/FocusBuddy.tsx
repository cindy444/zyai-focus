import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type BuddyAnimation = 'walk' | 'jump' | 'dance' | 'lookUp' | 'climb'

interface FocusBuddyProps {
  animation: BuddyAnimation
  position?: [number, number, number]
  color?: string
  hatType?: 'none' | 'party' | 'halo' | 'star'
}

export default function FocusBuddy({
  animation,
  position = [0, 0, 0],
  color = '#fde68a',
  hatType = 'none',
}: FocusBuddyProps) {
  const groupRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const t = performance.now() / 1000

    // Arm and leg animations
    const la = leftArmRef.current
    const ra = rightArmRef.current
    const ll = leftLegRef.current
    const rl = rightLegRef.current

    switch (animation) {
      case 'walk': {
        const swing = Math.sin(t * 4) * 0.5
        if (la) la.rotation.x = swing
        if (ra) ra.rotation.x = -swing
        if (ll) ll.rotation.x = -swing * 0.7
        if (rl) rl.rotation.x = swing * 0.7
        // Subtle bob
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 4)) * 0.05
        break
      }
      case 'jump': {
        const jumpY = Math.abs(Math.sin(t * 3)) * 0.4
        groupRef.current.position.y = position[1] + jumpY
        // Arms go up on jump
        const armUp = -Math.PI * 0.3 - Math.abs(Math.sin(t * 3)) * 0.5
        if (la) la.rotation.z = armUp
        if (ra) ra.rotation.z = -armUp
        break
      }
      case 'dance': {
        // Sway side to side
        groupRef.current.rotation.z = Math.sin(t * 2) * 0.15
        groupRef.current.position.y = position[1] + Math.sin(t * 4) * 0.05
        // Wave arms
        if (la) {
          la.rotation.z = -Math.PI * 0.4 - Math.sin(t * 3) * 0.4
          la.rotation.x = Math.sin(t * 2.5) * 0.3
        }
        if (ra) {
          ra.rotation.z = Math.PI * 0.4 + Math.cos(t * 3) * 0.4
          ra.rotation.x = Math.cos(t * 2.5) * 0.3
        }
        break
      }
      case 'lookUp': {
        // Gentle idle sway, head tilted up
        groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.02
        if (la) la.rotation.z = -0.2
        if (ra) ra.rotation.z = 0.2
        break
      }
      case 'climb': {
        const climbSwing = Math.sin(t * 3) * 0.3
        if (la) la.rotation.x = climbSwing
        if (ra) ra.rotation.x = -climbSwing
        if (ll) ll.rotation.x = -climbSwing * 0.6
        if (rl) rl.rotation.x = climbSwing * 0.6
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 3)) * 0.03
        break
      }
    }

    // Slow continuous rotation doesn't apply — keep facing camera
    void delta
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Head */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      {/* Left eye */}
      <mesh position={[-0.1, 0.72, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.1, 0.72, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Smile — small torus arc */}
      <mesh position={[0, 0.58, 0.25]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.15, 0]}>
        <capsuleGeometry args={[0.2, 0.3, 8, 16]} />
        <meshStandardMaterial color="#c4b5fd" emissive="#a78bfa" emissiveIntensity={0.2} />
      </mesh>

      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.3, 0.25, 0]}>
        <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      {/* Right arm */}
      <mesh ref={rightArmRef} position={[0.3, 0.25, 0]}>
        <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>

      {/* Left leg */}
      <mesh ref={leftLegRef} position={[-0.1, -0.2, 0]}>
        <capsuleGeometry args={[0.07, 0.2, 4, 8]} />
        <meshStandardMaterial color="#a5b4fc" emissive="#818cf8" emissiveIntensity={0.15} />
      </mesh>
      {/* Right leg */}
      <mesh ref={rightLegRef} position={[0.1, -0.2, 0]}>
        <capsuleGeometry args={[0.07, 0.2, 4, 8]} />
        <meshStandardMaterial color="#a5b4fc" emissive="#818cf8" emissiveIntensity={0.15} />
      </mesh>

      {/* Hat variations */}
      {hatType === 'party' && (
        <mesh position={[0, 0.98, 0]}>
          <coneGeometry args={[0.12, 0.25, 8]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
      )}
      {hatType === 'halo' && (
        <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.025, 8, 24]} />
          <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.5} />
        </mesh>
      )}
      {hatType === 'star' && (
        <mesh position={[0, 1.0, 0]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  )
}
