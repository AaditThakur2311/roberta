// Particle Burst System - Themed effects for habit completion
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleBurstProps {
    position: [number, number, number];
    color: string;
    count?: number;
    onComplete?: () => void;
}

export const ParticleBurst = ({
    position,
    color,
    count = 50,
    onComplete
}: ParticleBurstProps) => {
    const pointsRef = useRef<THREE.Points>(null);
    const startTime = useRef(Date.now());
    const duration = 1500; // 1.5 seconds

    // Generate particle positions and velocities
    const { positions, velocities } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Start at center
            positions[i3] = position[0];
            positions[i3 + 1] = position[1];
            positions[i3 + 2] = position[2];

            // Random velocity in sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = 0.5 + Math.random() * 1.5;

            velocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
            velocities[i3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
            velocities[i3 + 2] = speed * Math.cos(phi);
        }

        return { positions, velocities };
    }, [count, position]);

    // Create geometry
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, [positions]);

    useFrame(() => {
        if (!pointsRef.current) return;

        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            if (onComplete) onComplete();
            return;
        }

        const positionAttr = pointsRef.current.geometry.attributes.position;

        // Update positions
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positionAttr.array[i3] = positions[i3] + velocities[i3] * elapsed * 0.01;
            positionAttr.array[i3 + 1] = positions[i3 + 1] + velocities[i3 + 1] * elapsed * 0.01;
            positionAttr.array[i3 + 2] = positions[i3 + 2] + velocities[i3 + 2] * elapsed * 0.01;
        }

        positionAttr.needsUpdate = true;

        // Fade out
        const material = pointsRef.current.material as THREE.PointsMaterial;
        material.opacity = 1 - progress;
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                size={0.1}
                color={color}
                transparent
                opacity={1}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};
