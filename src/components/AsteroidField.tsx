// Asteroid Field - 3D visual representation of events
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getEventColor } from '@/utils/eventGenerator';

import type { AsteroidEvent } from '@/types';

export const AsteroidField = () => {
    const events = useStore(state => state.events.filter(e => !e.claimed && new Date(e.expiresAt) > new Date()));
    const claimEvent = useStore(state => state.claimEvent);

    return (
        <group>
            {events.map(event => (
                <Asteroid
                    key={event.id}
                    event={event}
                    onClick={() => claimEvent(event.id)}
                />
            ))}
        </group>
    );
};

const Asteroid = ({ event, onClick }: { event: AsteroidEvent, onClick: () => void }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const color = getEventColor(event.eventType);

    // Random initial position on shell
    const position = useMemo(() => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 4.5; // Just outside shield rings

        return new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    }, []);

    // Rotation axis
    const rotationAxis = useMemo(() => {
        return new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Rotate
        meshRef.current.rotateOnAxis(rotationAxis, delta * 0.5);

        // Float/Pulse
        const time = state.clock.elapsedTime;
        meshRef.current.position.y += Math.sin(time) * 0.002;

        // Fade in
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'default'}
        >
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                roughness={0.7}
                metalness={0.8}
            />
        </mesh>
    );
};
