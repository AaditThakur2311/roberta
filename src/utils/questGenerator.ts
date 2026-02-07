// Quest Generator - Emergency and special missions
import type { Quest } from '@/types';
import { generateId } from '@/utils/gamification';

type QuestType = 'emergency_boost' | 'repair' | 'auxiliary_power' | 'meltdown_prevention';

interface QuestDef {
    type: QuestType;
    name: string;
    description: string;
    requirements: {
        habitCount?: number;
        category?: string;
        timeLimit?: number; // ms
    };
    reward: {
        energy: number;
        buff?: string;
        exitCritical?: boolean;
    };
    duration: number; // ms to complete
}

const EMERGENCY_QUESTS: QuestDef[] = [
    {
        type: 'emergency_boost',
        name: 'Rapid Stabilization',
        description: 'Critical failure imminent. Complete 3 habits quickly to stabilize output.',
        requirements: { habitCount: 3, timeLimit: 2 * 60 * 60 * 1000 },
        reward: { energy: 100, exitCritical: true },
        duration: 2 * 60 * 60 * 1000 // 2 hours
    },
    {
        type: 'auxiliary_power',
        name: 'Auxiliary Power Routing',
        description: 'Main core failing. Activate 5 low-power systems (habits) to maintain life support.',
        requirements: { habitCount: 5, timeLimit: 12 * 60 * 60 * 1000 },
        reward: { energy: 75 },
        duration: 12 * 60 * 60 * 1000 // 12 hours
    },
    {
        type: 'repair',
        name: 'Structural Repair',
        description: 'Core containment breach. Perform maintenance immediately.',
        requirements: { habitCount: 1, category: 'physical', timeLimit: 1 * 60 * 60 * 1000 },
        reward: { energy: 50, exitCritical: true },
        duration: 1 * 60 * 60 * 1000 // 1 hour
    }
];

export const generateEmergencyQuest = (): Quest => {
    // Pick a random emergency quest
    const def = EMERGENCY_QUESTS[Math.floor(Math.random() * EMERGENCY_QUESTS.length)];

    return {
        id: generateId(),
        type: def.type,
        name: def.name,
        description: def.description,
        requirements: def.requirements,
        reward: def.reward,
        progress: 0,
        completed: false,
        expiresAt: new Date(Date.now() + def.duration)
    };
};
