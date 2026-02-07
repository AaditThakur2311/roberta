// Shield Rings - Unlock at 7-day streak milestones
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { animated, useSpring } from '@react-spring/three';

interface ShieldRingProps {
    index: number;
    radius: number;
}

export const ShieldRing = ({ index, radius }: ShieldRingProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Unlock animation
    const { scale, opacity } = useSpring({
        from: { scale: 0.5, opacity: 0 },
        to: { scale: 1, opacity: 0.6 },
        config: { tension: 120, friction: 14 }
    });

    // Rotation animation
    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.z += 0.0005 * delta * 60 * (index + 1);
        }
    });

    return (
        <animated.mesh
            ref={meshRef}
            rotation-x={Math.PI / 2}
            scale={scale as any}
        >
            <torusGeometry args={[radius, 0.08, 16, 100]} />
            <meshStandardMaterial
                color="#00aaff"
                emissive="#0066cc"
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.2}
                transparent
                opacity={opacity as any}
            />
        </animated.mesh>
    );
};
