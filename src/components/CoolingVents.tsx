// Cooling Vents - Active when stability 50-79%
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VENT_POSITIONS = [
    [1.8, 0, 0], [-1.8, 0, 0],
    [0, 1.8, 0], [0, -1.8, 0],
    [1.3, 0, 1.3], [-1.3, 0, -1.3],
    [0, 1.3, 1.3], [0, -1.3, -1.3]
];

export const CoolingVents = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Pulsing emissive
        groupRef.current?.children.forEach((vent) => {
            if (vent instanceof THREE.Mesh && vent.material instanceof THREE.MeshStandardMaterial) {
                vent.material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {VENT_POSITIONS.map((pos, i) => {
                const position = new THREE.Vector3(pos[0], pos[1], pos[2]);
                const lookAtCenter = new THREE.Vector3(0, 0, 0);

                return (
                    <mesh
                        key={i}
                        position={position}
                        onUpdate={(self) => self.lookAt(lookAtCenter)}
                    >
                        <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
                        <meshStandardMaterial
                            color="#00ff88"
                            emissive="#00ff88"
                            emissiveIntensity={0.3}
                            metalness={0.6}
                            roughness={0.4}
                        />
                    </mesh>
                );
            })}
        </group>
    );
};
