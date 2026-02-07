// Starfield Background - Procedural stars with parallax
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const StarfieldBackground = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const { mouse } = useThree();

    // Generate star positions
    const { positions, colors, sizes } = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Random position in sphere
            const radius = 50 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Color variation (blue-white)
            const colorVariation = 0.7 + Math.random() * 0.3;
            colors[i3] = colorVariation;
            colors[i3 + 1] = colorVariation;
            colors[i3 + 2] = 1.0;

            // Size variation
            sizes[i] = Math.random() * 2 + 0.5;
        }

        return { positions, colors, sizes };
    }, []);

    // Parallax effect
    useFrame(() => {
        if (pointsRef.current) {
            // Subtle parallax based on mouse position
            pointsRef.current.rotation.x = mouse.y * 0.05;
            pointsRef.current.rotation.y = mouse.x * 0.05;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                    args={[colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={sizes.length}
                    array={sizes}
                    itemSize={1}
                    args={[sizes, 1]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={2}
                sizeAttenuation
                vertexColors
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
