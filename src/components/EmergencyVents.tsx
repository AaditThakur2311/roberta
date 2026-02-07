// Emergency Vents - Active when stability < 20% (Critical Mode)
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const EMERGENCY_POSITIONS = [
    [0, 2.2, 0], [0, -2.2, 0],   // Top/bottom
    [2.2, 0, 0], [-2.2, 0, 0],   // Left/right
    [0, 0, 2.2], [0, 0, -2.2]    // Front/back
];

export const EmergencyVents = () => {
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        // Trigger screen shake when vents open
        if ((window as any).__triggerScreenShake) {
            (window as any).__triggerScreenShake();
        }
    }, []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Rapid pulse
        groupRef.current?.children.forEach((vent) => {
            if (vent instanceof THREE.Mesh && vent.material instanceof THREE.MeshStandardMaterial) {
                vent.material.emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.2;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {EMERGENCY_POSITIONS.map((pos, i) => {
                const position = new THREE.Vector3(pos[0], pos[1], pos[2]);
                const lookAtCenter = new THREE.Vector3(0, 0, 0);

                return (
                    <mesh
                        key={i}
                        position={position}
                        onUpdate={(self) => self.lookAt(lookAtCenter)}
                    >
                        <coneGeometry args={[0.4, 1.2, 6]} />
                        <meshStandardMaterial
                            color="#ff3300"
                            emissive="#ff3300"
                            emissiveIntensity={0.8}
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </mesh>
                );
            })}
        </group>
    );
};
