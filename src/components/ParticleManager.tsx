// Particle Manager - Manages active particle bursts
import { useState, useCallback } from 'react';
import { ParticleBurst } from './ParticleBurst';

interface Burst {
    id: string;
    position: [number, number, number];
    color: string;
}

export const ParticleManager = () => {
    const [bursts, setBursts] = useState<Burst[]>([]);

    const removeBurst = useCallback((id: string) => {
        setBursts(prev => prev.filter(b => b.id !== id));
    }, []);

    // Expose trigger function to window
    const triggerBurst = useCallback((position: [number, number, number], color: string) => {
        const id = `burst-${Date.now()}-${Math.random()}`;
        setBursts(prev => [...prev, { id, position, color }]);
    }, []);

    // Expose to window for store access
    if (typeof window !== 'undefined') {
        (window as any).__triggerParticleBurst = triggerBurst;
    }

    return (
        <>
            {bursts.map(burst => (
                <ParticleBurst
                    key={burst.id}
                    position={burst.position}
                    color={burst.color}
                    onComplete={() => removeBurst(burst.id)}
                />
            ))}
        </>
    );
};
