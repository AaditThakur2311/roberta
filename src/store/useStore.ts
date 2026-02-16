// Zustand Store - Core state management for CORE: IGNITION
import { create } from 'zustand';
import type { CoreStore, Habit, Artifact, Quest, AsteroidEvent } from '@/types';
import {
    calculateEnergyGain,
    calculateStability,
    calculateMaxCapacity,
    calculateShieldLevel,
    generateId,
    shouldBreakStreak,
    detectIdleState,
    updateReactorEnergy,
    CRITICAL_THRESHOLD,
    OVERDRIVE_THRESHOLD
} from '@/utils/gamification';
import { rollForEvent } from '@/utils/eventGenerator';
import { generateEmergencyQuest } from '@/utils/questGenerator';


const STORAGE_KEY = 'core-ignition-state';

export const useStore = create<CoreStore>((set, get) => ({
    // Initial state
    habits: [],
    artifacts: [],
    reactor: {
        currentEnergy: 500,
        maxCapacity: 1000,
        stability: 0.5,
        shieldLevel: 0,
        isCritical: false,
        isHibernating: false,
        isOverdrive: false,
        lastDecayUpdate: new Date()
    },
    quests: [],
    events: [],
    ethicalSettings: {
        enabled: false,
        dailyCap: 10,
        cooldownReminderMinutes: 30,
        sessionOverride: false
    },
    modularGeometry: {
        shieldRings: 0,
        coolingVentsActive: false,
        emergencyVentsActive: false,
        structuralDamage: false
    },
    syncState: {
        status: 'idle',
        lastSyncedAt: null,
        errorMessage: null
    },

    setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline', msg: string | null = null) => set(state => ({
        syncState: { ...state.syncState, status, errorMessage: msg, ...(status === 'synced' ? { lastSyncedAt: new Date() } : {}) }
    })),

    // Habit actions
    addHabit: (habitData) => {
        const habit: Habit = {
            ...habitData,
            id: generateId(),
            createdAt: new Date(),
            currentStreak: 0,
            lastCompleted: null,
            completionHistory: []
        };

        set(state => ({
            habits: [...state.habits, habit]
        }));

        get().saveToLocalStorage();
    },

    completeHabit: (id) => {
        const state = get();
        const habit = state.habits.find(h => h.id === id);
        if (!habit) return;

        // Ethical check: Daily Cap
        if (state.ethicalSettings.enabled && !state.ethicalSettings.sessionOverride) {
            const today = new Date();
            const habitsToday = state.habits.reduce((count, h) => {
                const completedToday = h.completionHistory.some(d =>
                    new Date(d).getDate() === today.getDate() &&
                    new Date(d).getMonth() === today.getMonth() &&
                    new Date(d).getFullYear() === today.getFullYear()
                );
                return count + (completedToday ? 1 : 0);
            }, 0);

            if (habitsToday >= state.ethicalSettings.dailyCap) {
                console.log('Daily cap reached.');
                get().addNotification('DAILY CAPACITY EXCEEDED - SYSTEM COOLDOWN ACTIVE', 'critical');
                // Proceed to update habit but set energyGain to 0
            }
        }

        let energyGain = calculateEnergyGain(habit, state.artifacts, state.reactor.isOverdrive);

        // Ethical Check Implementation (Zero energy if capped)
        const today = new Date();
        const habitsToday = state.habits.reduce((count, h) => {
            // simplified logic for checking if completed today. 
            // In real app, completionHistory holds all dates. 
            // We need to count completions from *today* across all habits? 
            // Or just count how many habits were done today?
            // Assuming total completions today.
            return count + h.completionHistory.filter(d =>
                new Date(d).getDate() === today.getDate() &&
                new Date(d).getMonth() === today.getMonth() &&
                new Date(d).getFullYear() === today.getFullYear()
            ).length;
        }, 0);

        if (state.ethicalSettings.enabled && !state.ethicalSettings.sessionOverride) {
            if (habitsToday >= state.ethicalSettings.dailyCap) {
                energyGain = 0;
            }
        }

        // Update habit
        const updatedHabits = state.habits.map(h => {
            if (h.id === id) {
                const now = new Date();
                return {
                    ...h,
                    currentStreak: h.currentStreak + 1,
                    lastCompleted: now,
                    completionHistory: [...h.completionHistory, now]
                };
            }
            return h;
        });

        // Update Quest Progress
        const activeQuests = state.quests.filter(q => !q.completed && new Date(q.expiresAt) > new Date());
        let questUpdates = state.quests;

        if (activeQuests.length > 0) {
            questUpdates = state.quests.map(q => {
                if (q.completed || new Date(q.expiresAt) <= new Date()) return q;

                // Check category requirement
                if (q.requirements.category && q.requirements.category !== habit.category) return q;

                const newProgress = q.progress + 1;
                const isComplete = newProgress >= (q.requirements.habitCount || 1);

                if (isComplete) {
                    // Apply quest reward
                    energyGain += q.reward.energy;

                    if ((window as any).__audioEngine) {
                        (window as any).__audioEngine.playCompletionSound('creative'); // Victory sound
                    }
                }

                return {
                    ...q,
                    progress: newProgress,
                    completed: isComplete
                };
            });
        }

        // Update reactor energy
        const maxCapacity = calculateMaxCapacity(state.artifacts);
        const newEnergy = Math.min(state.reactor.currentEnergy + energyGain, maxCapacity);
        const stability = calculateStability(newEnergy, maxCapacity);

        // Check for Quest Exit Critical
        const criticalExit = questUpdates.some(q => q.completed && q.reward.exitCritical);
        const isCritical = criticalExit ? false : stability < CRITICAL_THRESHOLD;

        set({
            habits: updatedHabits,
            quests: questUpdates,
            reactor: {
                ...state.reactor,
                currentEnergy: newEnergy,
                maxCapacity,
                stability,
                isCritical,
                isOverdrive: stability > OVERDRIVE_THRESHOLD,
                lastDecayUpdate: new Date()
            }
        });

        // Trigger pulse effect
        if ((window as any).__reactorPulse) {
            (window as any).__reactorPulse();
        }

        // Trigger particle burst
        if ((window as any).__triggerParticleBurst) {
            const categoryColors: Record<string, string> = {
                physical: '#ff6b6b',
                mental: '#4dabf7',
                social: '#51cf66',
                creative: '#cc5de8'
            };
            (window as any).__triggerParticleBurst([0, 0, 0], categoryColors[habit.category] || '#00aaff');
        }

        // Play completion sound
        if ((window as any).__audioEngine) {
            (window as any).__audioEngine.playCompletionSound(habit.category);
        }

        // Check for artifact unlock (7-day streak)
        if ((habit.currentStreak + 1) % 7 === 0) {
            get().unlockArtifact(id);
        }

        // Update modular geometry
        get().updateModularGeometry();
        get().saveToLocalStorage();
    },

    deleteHabit: (id) => {
        set(state => ({
            habits: state.habits.filter(h => h.id !== id)
        }));
        get().saveToLocalStorage();
    },

    // Reactor actions
    updateReactorEnergy: () => {
        const state = get();
        const newEnergy = updateReactorEnergy(state.reactor, state.artifacts);
        const maxCapacity = calculateMaxCapacity(state.artifacts);
        const stability = calculateStability(newEnergy, maxCapacity);

        // Check for streak breaks
        const updatedHabits = state.habits.map(habit => {
            if (shouldBreakStreak(habit)) {
                return {
                    ...habit,
                    currentStreak: 0
                };
            }
            return habit;
        });

        // Check for idle state
        const isIdle = detectIdleState(state.habits);

        // Try to spawn event
        const newEvent = rollForEvent();
        const updatedEvents = newEvent
            ? [...state.events, { ...newEvent, id: generateId() }]
            : state.events;

        // Check for Critical Mode -> Spawn Emergency Quest
        let currentQuests = state.quests;
        const isCritical = stability < CRITICAL_THRESHOLD;
        const hasActiveEmergencyQuest = currentQuests.some(q =>
            ['emergency_boost', 'repair', 'auxiliary_power'].includes(q.type) &&
            !q.completed &&
            new Date(q.expiresAt) > new Date()
        );

        if (isCritical && !hasActiveEmergencyQuest) {
            // 10% chance per tick to spawn quest if not already active to avoid spam? 
            // Or spawn immediately when critical? Let's spawn immediately.
            const quest = generateEmergencyQuest();
            currentQuests = [...currentQuests, quest];

            // Trigger alarm
            if ((window as any).__audioEngine) {
                // TODO: trigger alarm
            }
        }

        set({
            habits: updatedHabits,
            reactor: {
                ...state.reactor,
                currentEnergy: newEnergy,
                maxCapacity,
                stability,
                isCritical,
                isOverdrive: stability > OVERDRIVE_THRESHOLD,
                isHibernating: isIdle,
                lastDecayUpdate: new Date()
            },
            events: updatedEvents,
            quests: currentQuests
        });

        get().updateModularGeometry();
        get().saveToLocalStorage();
    },

    enterHibernation: () => {
        set(state => ({
            reactor: {
                ...state.reactor,
                isHibernating: true
            }
        }));
    },

    exitHibernation: () => {
        set(state => ({
            reactor: {
                ...state.reactor,
                isHibernating: false
            }
        }));
    },

    // Artifact actions
    unlockArtifact: (habitId) => {
        const state = get();
        const habit = state.habits.find(h => h.id === habitId);
        if (!habit) return;

        // Generate artifact based on category
        const buffMap: Record<string, { type: any; value: number; name: string }> = {
            physical: { type: 'decay_reduction', value: 0.05, name: 'Thermal Insulation' },
            mental: { type: 'capacity_boost', value: 50, name: 'Neural Amplifier' },
            social: { type: 'streak_protection', value: 1, name: 'Social Shield' },
            creative: { type: 'energy_multiplier', value: 0.1, name: 'Inspiration Core' }
        };

        const buff = buffMap[habit.category];
        const artifact: Artifact = {
            id: generateId(),
            name: buff.name,
            svgData: '', // TODO: Generate procedural SVG
            buffType: buff.type,
            buffValue: buff.value,
            category: habit.category,
            unlockedAt: new Date()
        };

        set(state => ({
            artifacts: [...state.artifacts, artifact],
            reactor: {
                ...state.reactor,
                shieldLevel: calculateShieldLevel(state.artifacts.length + 1)
            }
        }));

        get().saveToLocalStorage();
    },

    consumeArtifact: (id) => {
        set(state => ({
            artifacts: state.artifacts.filter(a => a.id !== id),
            reactor: {
                ...state.reactor,
                currentEnergy: Math.min(
                    state.reactor.currentEnergy + 500,
                    state.reactor.maxCapacity
                ),
                shieldLevel: calculateShieldLevel(state.artifacts.length - 1)
            }
        }));
        get().saveToLocalStorage();
    },

    // Quest actions
    addQuest: (questData) => {
        const quest: Quest = {
            ...questData,
            id: generateId()
        };

        set(state => ({
            quests: [...state.quests, quest]
        }));
    },

    completeQuest: (id) => {
        set(state => ({
            quests: state.quests.map(q =>
                q.id === id ? { ...q, completed: true } : q
            )
        }));
    },

    // Ethical Actions
    toggleEthicalMode: () => {
        set(state => ({
            ethicalSettings: {
                ...state.ethicalSettings,
                enabled: !state.ethicalSettings.enabled
            }
        }));
        get().saveToLocalStorage();
    },

    toggleSessionOverride: () => {
        set(state => ({
            ethicalSettings: {
                ...state.ethicalSettings,
                sessionOverride: !state.ethicalSettings.sessionOverride
            }
        }));
        // Don't save override to local storage? Or do we? usually session override is transient.
        // But for simplicity let's not persist it or handle it in load.
        // We'll save it for now to persist across refreshes if user wants.
        get().saveToLocalStorage();
    },

    // Event actions
    spawnEvent: (eventData) => {
        const event: AsteroidEvent = {
            ...eventData,
            id: generateId()
        };

        set(state => ({
            events: [...state.events, event]
        }));
    },

    claimEvent: (id) => {
        const state = get();
        const event = state.events.find(e => e.id === id);
        if (!event || event.claimed) return;

        // Apply reward
        let energyBonus = event.reward.energy || 0;

        set(state => ({
            events: state.events.map(e =>
                e.id === id ? { ...e, claimed: true } : e
            ),
            reactor: {
                ...state.reactor,
                currentEnergy: Math.min(
                    state.reactor.currentEnergy + energyBonus,
                    state.reactor.maxCapacity
                )
            }
        }));

        get().saveToLocalStorage();
    },

    // Modular geometry
    updateModularGeometry: () => {
        const state = get();
        const maxStreak = Math.max(...state.habits.map(h => h.currentStreak), 0);
        const { stability } = state.reactor;

        set({
            modularGeometry: {
                shieldRings: [3, 7, 14].filter(milestone => maxStreak >= milestone).length,
                coolingVentsActive: stability >= 0.5 && stability < 0.8,
                emergencyVentsActive: stability < 0.2,
                structuralDamage: stability < 0.1
            }
        });
    },

    // Persistence
    saveToLocalStorage: () => {
        const state = get();

        // Prune history > 90 days (Item 4)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const prunedHabits = state.habits.map(h => ({
            ...h,
            completionHistory: h.completionHistory.filter(d => new Date(d) > ninetyDaysAgo)
        }));

        const dataToSave = {
            habits: prunedHabits,
            artifacts: state.artifacts,
            reactor: state.reactor,
            quests: state.quests,
            events: state.events,
            ethicalSettings: state.ethicalSettings
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    },

    loadFromLocalStorage: () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                set({
                    habits: data.habits || [],
                    artifacts: data.artifacts || [],
                    reactor: data.reactor || get().reactor,
                    quests: data.quests || [],
                    events: data.events || [],
                    ethicalSettings: data.ethicalSettings || get().ethicalSettings
                });
                get().updateModularGeometry();
            } catch (error) {
                console.error('Failed to load state:', error);
                get().addNotification('Failed to load local save data', 'error');
            }
        }
    },

    // Notifications
    notifications: [],
    addNotification: (message, type) => {
        const id = generateId();
        set(state => ({
            notifications: [...state.notifications, { id, message, type }]
        }));
        // Auto dismiss
        setTimeout(() => get().removeNotification(id), 5000);
    },
    removeNotification: (id) => {
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
        }));
    }
}));

// Auto-update reactor energy every minute
setInterval(() => {
    useStore.getState().updateReactorEnergy();
}, 60000);

// Expose debug helpers
if (typeof window !== 'undefined') {
    (window as any).__spawnDebugEvent = () => {
        useStore.getState().spawnEvent({
            eventType: 'energy_surge',
            reward: { energy: 50 },
            triggeredAt: new Date(),
            claimed: false,
            expiresAt: new Date(Date.now() + 60000)
        });
    };

    (window as any).__triggerEmergency = () => {
        useStore.setState(state => ({
            reactor: { ...state.reactor, stability: 0.1, isCritical: true, currentEnergy: 100 }
        }));
        useStore.getState().updateReactorEnergy();
    };

    (window as any).__toggleEthicalOverride = () => {
        useStore.getState().toggleSessionOverride();
    };
}
