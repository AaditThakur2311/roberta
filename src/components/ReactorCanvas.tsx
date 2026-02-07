// Enhanced ReactorCanvas with ParticleManager and AsteroidField
import { useStore } from '@/store/useStore';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import { StarfieldBackground } from './StarfieldBackground';
import { ParticleManager } from './ParticleManager';
import { AsteroidField } from './AsteroidField';

export const ReactorCanvas = () => {
    const { stability, isOverdrive, isCritical } = useStore(state => state.reactor);

    // Dynamic bloom intensity - "Supernova" effect at 90%+ energy
    const bloomIntensity = isOverdrive ? 2.0 : stability > 0.9 ? 1.5 : 0.5;

    return (
        <div className="fixed inset-0 pointer-events-none">
            <Canvas
                camera={{
                    position: [0, 0, 10],
                    fov: 50,
                    near: 0.1,
                    far: 1000
                }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={0.5} color="#00aaff" />
                <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00ffaa" />

                {/* Scene */}
                <StarfieldBackground />
                <AsteroidField />
                <ParticleManager />

                {/* Post-processing */}
                <EffectComposer>
                    <Bloom
                        intensity={bloomIntensity}
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                    />
                    {isCritical ? (
                        <>
                            <ChromaticAberration
                                blendFunction={BlendFunction.NORMAL}
                                offset={new Vector2(0.002, 0.002)}
                                radialModulation={false}
                                modulationOffset={0}
                            />
                        </>
                    ) : <></>}
                </EffectComposer>
            </Canvas>
        </div>
    );
};
