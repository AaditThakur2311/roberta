// Demo state with procedural artifacts
import type { Habit, Artifact, ReactorState } from '@/types';
import { generateArtifactSVG } from '@/utils/artifactGenerator';

export const demoHabits: Habit[] = [
    {
        id: 'demo-1',
        name: 'Morning Exercise',
        category: 'physical',
        frequency: 'daily',
        currentStreak: 14,
        lastCompleted: new Date(),
        completionHistory: [new Date()],
        createdAt: new Date()
    },
    {
        id: 'demo-2',
        name: 'Meditation',
        category: 'mental',
        frequency: 'daily',
        currentStreak: 7,
        lastCompleted: new Date(),
        completionHistory: [new Date()],
        createdAt: new Date()
    },
    {
        id: 'demo-3',
        name: 'Read 30min',
        category: 'mental',
        frequency: 'daily',
        currentStreak: 3,
        lastCompleted: new Date(),
        completionHistory: [new Date()],
        createdAt: new Date()
    },
    {
        id: 'demo-4',
        name: 'Call a friend',
        category: 'social',
        frequency: 'weekly',
        currentStreak: 1,
        lastCompleted: new Date(),
        completionHistory: [new Date()],
        createdAt: new Date()
    },
    {
        id: 'demo-5',
        name: 'Creative writing',
        category: 'creative',
        frequency: 'daily',
        currentStreak: 5,
        lastCompleted: null,
        completionHistory: [],
        createdAt: new Date()
    }
];

export const demoArtifacts: Artifact[] = [
    {
        id: 'artifact-1',
        name: 'Thermal Insulation',
        svgData: generateArtifactSVG('demo-artifact-1', 'physical'),
        buffType: 'decay_reduction',
        buffValue: 0.05,
        category: 'physical',
        unlockedAt: new Date()
    },
    {
        id: 'artifact-2',
        name: 'Neural Amplifier',
        svgData: generateArtifactSVG('demo-artifact-2', 'mental'),
        buffType: 'capacity_boost',
        buffValue: 50,
        category: 'mental',
        unlockedAt: new Date()
    }
];

export const demoReactor: ReactorState = {
    currentEnergy: 525,
    maxCapacity: 1050,
    stability: 0.5,
    shieldLevel: 0,
    isCritical: false,
    isHibernating: false,
    isOverdrive: false,
    lastDecayUpdate: new Date()
};
