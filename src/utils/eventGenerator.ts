// Asteroid Generator - Random event system
import type { AsteroidEvent } from '@/types';

type EventType = 'energy_surge' | 'artifact_fragment' | 'time_dilation' | 'quantum_flux';

interface EventDef {
    type: EventType;
    name: string;
    description: string;
    probability: number; // 0-1
    reward: {
        energy?: number;
        artifactProgress?: number;
        decayPause?: number; // hours
        buff?: string;
    };
    duration: number; // ms to claim
    color: string;
}

const EVENT_DEFINITIONS: EventDef[] = [
    {
        type: 'energy_surge',
        name: 'Energy Surge',
        description: 'High concentration of raw fuel detected.',
        probability: 0.5,
        reward: { energy: 50 },
        duration: 60000,
        color: '#00ccff'
    },
    {
        type: 'artifact_fragment',
        name: 'Artifact Fragment',
        description: 'Ancient technology debris drifting nearby.',
        probability: 0.3,
        reward: { artifactProgress: 0.33 },
        duration: 45000,
        color: '#ffd700'
    },
    {
        type: 'time_dilation',
        name: 'Time Dilation',
        description: 'Temporal distortion field. Pauses decay.',
        probability: 0.15,
        reward: { decayPause: 12 },
        duration: 30000,
        color: '#cc00ff'
    },
    {
        type: 'quantum_flux',
        name: 'Quantum Flux',
        description: 'Unstable anomaly. Unpredictable effects.',
        probability: 0.05,
        reward: { buff: 'random' },
        duration: 15000,
        color: '#ff00aa'
    }
];

export const rollForEvent = (): Omit<AsteroidEvent, 'id'> | null => {
    // 30% chance per roll (daily/hourly logic handled by caller)
    if (Math.random() > 0.3) return null;

    const roll = Math.random();
    let cumulative = 0;

    for (const def of EVENT_DEFINITIONS) {
        cumulative += def.probability;
        if (roll <= cumulative) {
            return {
                eventType: def.type,
                reward: def.reward,
                triggeredAt: new Date(),
                claimed: false,
                expiresAt: new Date(Date.now() + def.duration)
            };
        }
    }

    return null;
};

export const getEventColor = (type: string): string => {
    return EVENT_DEFINITIONS.find(e => e.type === type)?.color || '#ffffff';
};
