// Slump Oracle - Pattern prediction and intervention system
import { useEffect, useState } from 'react';
import type { Habit } from '@/types';

interface OracleAnalysis {
    trend: 'improving' | 'stable' | 'declining' | 'critical';
    message: string;
    suggestedAction: string;
    confidence: number;
}

export const useOracle = (habits: Habit[]): OracleAnalysis | null => {
    const [analysis, setAnalysis] = useState<OracleAnalysis | null>(null);

    useEffect(() => {
        if (habits.length === 0) {
            setAnalysis(null);
            return;
        }

        // Analyze last 14 days
        const now = new Date();
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Get daily completion counts
        const dailyCounts: number[] = [];
        for (let i = 0; i < 14; i++) {
            const dayStart = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

            const count = habits.reduce((sum, habit) => {
                const completionsInDay = habit.completionHistory.filter(date => {
                    const d = new Date(date);
                    return d >= dayStart && d < dayEnd;
                }).length;
                return sum + completionsInDay;
            }, 0);

            dailyCounts.push(count);
        }

        // Calculate moving averages
        const last7DaysAvg = dailyCounts.slice(-7).reduce((a, b) => a + b, 0) / 7;
        const previous7DaysAvg = dailyCounts.slice(0, 7).reduce((a, b) => a + b, 0) / 7;

        // Detect trend
        const trendDelta = last7DaysAvg - previous7DaysAvg;
        const trendPercent = previous7DaysAvg > 0 ? (trendDelta / previous7DaysAvg) * 100 : 0;

        // Check for consecutive low days
        const last3Days = dailyCounts.slice(-3);
        const avgLast3 = last3Days.reduce((a, b) => a + b, 0) / 3;
        const isConsecutiveLow = avgLast3 < previous7DaysAvg * 0.5;

        // Determine analysis
        let trend: OracleAnalysis['trend'];
        let message: string;
        let suggestedAction: string;
        let confidence: number;

        if (isConsecutiveLow && trendPercent < -30) {
            trend = 'critical';
            message = '⚠️ CRITICAL SLUMP DETECTED: Activity down 3 consecutive days';
            suggestedAction = 'Complete 1 easy habit today to break the pattern';
            confidence = 0.9;
        } else if (trendPercent < -20) {
            trend = 'declining';
            message = '📉 Declining trend: Activity down ' + Math.abs(Math.round(trendPercent)) + '%';
            suggestedAction = 'Focus on your highest-streak habit to maintain momentum';
            confidence = 0.75;
        } else if (trendPercent > 20) {
            trend = 'improving';
            message = '📈 Improving trend: Activity up ' + Math.round(trendPercent) + '%';
            suggestedAction = 'Great momentum! Consider adding a new habit';
            confidence = 0.8;
        } else {
            trend = 'stable';
            message = '✓ Stable pattern: Consistent activity';
            suggestedAction = 'Maintain current routine';
            confidence = 0.7;
        }

        setAnalysis({ trend, message, suggestedAction, confidence });
    }, [habits]);

    return analysis;
};
