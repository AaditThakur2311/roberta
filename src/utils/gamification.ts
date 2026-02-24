// Gamification utility functions
import type { Habit, Artifact, ReactorState } from '@/types';

// Constants
export const ENERGY_PER_HABIT = 10;
export const MAX_REACTOR_CAPACITY = 1000;
export const BASE_DECAY_RATE_PER_HOUR = 5;
export const CRITICAL_THRESHOLD = 0.2;
export const OVERDRIVE_THRESHOLD = 0.95;

// Calculate streak multiplier
export const calculateStreakMultiplier = (streak: number): number => {
    return Math.min(1 + (streak * 0.1), 3.0); // Max 3x at 20 days
};

// Calculate effective decay rate with buffs
export const calculateEffectiveDecay = (artifacts: Artifact[]): number => {
    const decayReduction = artifacts
        .filter(a => a.buffType === 'decay_reduction')
        .reduce((sum, a) => sum + a.buffValue, 0);

    return BASE_DECAY_RATE_PER_HOUR * (1 - Math.min(decayReduction, 0.8)); // Max 80% reduction
};

// Calculate max capacity with buffs
export const calculateMaxCapacity = (artifacts: Artifact[]): number => {
    const capacityBoost = artifacts
        .filter(a => a.buffType === 'capacity_boost')
        .reduce((sum, a) => sum + a.buffValue, 0);

    return MAX_REACTOR_CAPACITY + capacityBoost;
};

// Calculate energy gain for a habit
export const calculateEnergyGain = (
    habit: Habit,
    artifacts: Artifact[],
    isOverdrive: boolean
) => {
    const baseEnergy = ENERGY_PER_HABIT;
    const streakMultiplier = calculateStreakMultiplier(habit.currentStreak);

    const energyMultiplierBuffs = artifacts
        .filter(a => a.buffType === 'energy_multiplier')
        .reduce((sum, a) => sum + a.buffValue, 0);

    const totalMultiplier = streakMultiplier * (1 + energyMultiplierBuffs);
    const overdriveMultiplier = isOverdrive ? 2.0 : 1.0;

    const energyGain = baseEnergy * totalMultiplier * overdriveMultiplier;
    const newStreak = habit.currentStreak + 1;

    return { energyGain, newStreak };
};

// Update reactor energy based on time decay
export const updateReactorEnergy = (
    reactor: ReactorState,
    artifacts: Artifact[]
) => {
    const now = new Date();
    const lastUpdate = new Date(reactor.lastDecayUpdate);
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (reactor.isHibernating) {
        return { energy: reactor.currentEnergy, stability: reactor.stability };
    }

    const effectiveDecay = calculateEffectiveDecay(artifacts);
    const energyLoss = hoursSinceUpdate * effectiveDecay;

    const energy = Math.max(0, reactor.currentEnergy - energyLoss);
    const stability = energy / calculateMaxCapacity(artifacts);

    return { energy, stability };
};

// Calculate stability percentage
export const calculateStability = (currentEnergy: number, maxCapacity: number): number => {
    return Math.max(0, Math.min(1, currentEnergy / maxCapacity));
};

// Check if habit streak should be broken
export const shouldBreakStreak = (habit: Habit): boolean => {
    if (!habit.lastCompleted) return false;

    const now = new Date();
    const lastCompleted = new Date(habit.lastCompleted);
    const hoursSince = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60);

    if (habit.frequency === 'daily') {
        return hoursSince > 48; // 2 days grace period
    } else {
        return hoursSince > 168 * 2; // 2 weeks grace period for weekly
    }
};

// Generate unique ID
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate shield level
export const calculateShieldLevel = (artifactCount: number): number => {
    return Math.floor(artifactCount / 3);
};

// Detect if user has been idle
export const detectIdleState = (habits: Habit[]): boolean => {
    if (habits.length === 0) return false;

    const now = new Date();
    const mostRecentCompletion = habits.reduce((latest, habit) => {
        if (!habit.lastCompleted) return latest;
        const completed = new Date(habit.lastCompleted);
        return completed > latest ? completed : latest;
    }, new Date(0));

    const hoursSince = (now.getTime() - mostRecentCompletion.getTime()) / (1000 * 60 * 60);
    return hoursSince >= 48;
};
