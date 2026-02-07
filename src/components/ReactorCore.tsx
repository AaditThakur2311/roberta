// Reactor Core - Main 3D sphere with custom shader and modular geometry
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { ModularGeometry } from './ModularGeometry';

// Import shaders
import vertexShader from '@/shaders/reactorCore.vert';
import fragmentShader from '@/shaders/reactorCore.frag';

export const ReactorCore = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Get reactor state from store
    const { stability, isOverdrive } = useStore(state => ({
        stability: state.reactor.stability,
        isOverdrive: state.reactor.isOverdrive
    }));

    // Shader uniforms
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uStability: { value: stability },
        uPulse: { value: 0 },
        uOverdrive: { value: isOverdrive ? 1.0 : 0.0 }
    }), []);

    // Animation loop
    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;

            // Update time
            material.uniforms.uTime.value = state.clock.elapsedTime;

            // Update stability (smooth transition)
            material.uniforms.uStability.value = THREE.MathUtils.lerp(
                material.uniforms.uStability.value,
                stability,
                0.05
            );

            // Update overdrive
            material.uniforms.uOverdrive.value = THREE.MathUtils.lerp(
                material.uniforms.uOverdrive.value,
                isOverdrive ? 1.0 : 0.0,
                0.1
            );

            // Decay pulse
            if (material.uniforms.uPulse.value > 0) {
                material.uniforms.uPulse.value *= 0.95;
            }

            // Slow rotation
            meshRef.current.rotation.y += 0.001;
        }
    });

    // Trigger pulse effect (called from store when habit completed)
    const triggerPulse = () => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uPulse.value = 2.0;
        }
    };

    // Expose pulse trigger to store
    useMemo(() => {
        (window as any).__reactorPulse = triggerPulse;
    }, []);

    return (
        <group>
            {/* Core Sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Modular Attachments */}
            <ModularGeometry />
        </group>
    );
};
