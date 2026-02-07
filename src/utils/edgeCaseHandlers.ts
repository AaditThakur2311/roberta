// Edge Case Handlers - Idle Awakening, Overdrive, Flux Adaptation
import type { Habit } from '@/types';

/**
 * Idle Awakening Protocol
 * Triggers when no activity for 48+ hours
 */
export const checkIdleAwakening = (habits: Habit[]): boolean => {
    if (habits.length === 0) return false;

    const now = new Date();
    const allCompletions = habits.flatMap(h => h.completionHistory.map(d => new Date(d)));

    if (allCompletions.length === 0) return true; // No activity ever

    const mostRecent = new Date(Math.max(...allCompletions.map(d => d.getTime())));
    const hoursSince = (now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60);

    return hoursSince >= 48;
};

/**
 * Overdrive Mode Handler
 * Activates when stability > 95%
 * - 2x energy multiplier
 * - Burnout timer (6 hours)
 */
export const calculateOverdriveMultiplier = (isOverdrive: boolean): number => {
    return isOverdrive ? 2.0 : 1.0;
};

export const checkBurnoutRisk = (lastActivity: Date, isOverdrive: boolean): boolean => {
    if (!isOverdrive) return false;

    const now = new Date();
    const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    return hoursSince >= 6; // Burnout if no activity for 6 hours in overdrive
};

/**
 * Flux Adaptation
 * Detects inconsistent patterns (3 days on, 2 days off, repeat)
 * Applies stabilizer: -20% decay on "off" days, +5 energy bonus for breaking pattern
 */
export const detectFluxPattern = (habits: Habit[]): {
    hasFlux: boolean;
    variance: number;
} => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
    }).reverse();

    const dailyCounts = last14Days.map(date => {
        return habits.reduce((count, habit) => {
            const hasCompletion = habit.completionHistory.some(d => {
                const completionDate = new Date(d);
                return completionDate.getDate() === date.getDate() &&
                    completionDate.getMonth() === date.getMonth() &&
                    completionDate.getFullYear() === date.getFullYear();
            });
            return count + (hasCompletion ? 1 : 0);
        }, 0);
    });

    // Calculate variance
    const mean = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
    const variance = dailyCounts.reduce((sum, count) => {
        return sum + Math.pow(count - mean, 2);
    }, 0) / dailyCounts.length;

    const normalizedVariance = variance / (mean || 1);

    return {
        hasFlux: normalizedVariance > 0.4,
        variance: normalizedVariance
    };
};

export const applyFluxStabilizer = (baseDecay: number, hasFlux: boolean): number => {
    return hasFlux ? baseDecay * 0.8 : baseDecay; // -20% decay
};

export const getFluxBonusEnergy = (hasFlux: boolean, isOffDay: boolean): number => {
    // Bonus for completing on an "off" day (breaking the pattern)
    return hasFlux && !isOffDay ? 5 : 0;
};
