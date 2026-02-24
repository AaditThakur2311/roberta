// Zustand Store - Core state management for CORE: IGNITION
import { create } from 'zustand';
import type { CoreStore, Habit, Artifact, Quest, AsteroidEvent } from '@/types';
import {
    calculateEnergyGain,
    calculateShieldLevel,
    generateId,
    updateReactorEnergy,
    CRITICAL_THRESHOLD,
    OVERDRIVE_THRESHOLD
} from '@/utils/gamification';
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
        const habitIndex = state.habits.findIndex(h => h.id === id);
        if (habitIndex === -1) return;

        const habit = state.habits[habitIndex];
        const now = new Date();

        // Check if already completed today
        const isCompletedToday = habit.lastCompleted &&
            new Date(habit.lastCompleted).toDateString() === now.toDateString();

        if (isCompletedToday) return;

        // Ethical Balance Check
        if (state.ethicalSettings.enabled && !state.ethicalSettings.sessionOverride) {
            const todayCount = state.habits.filter(h =>
                h.lastCompleted && new Date(h.lastCompleted).toDateString() === now.toDateString()
            ).length;

            if (todayCount >= state.ethicalSettings.dailyCap) {
                state.addNotification("Daily ethical limit reached. Energy gain suspended for sustainability.", "info");
                // Log metadata but skip energy gain
                const updatedHabits = [...state.habits];
                updatedHabits[habitIndex] = {
                    ...habit,
                    lastCompleted: now,
                    completionHistory: [...habit.completionHistory, now]
                };
                set({ habits: updatedHabits });
                state.saveToLocalStorage();
                return;
            }
        }

        // Calculate energy gain
        const { energyGain, newStreak } = calculateEnergyGain(habit, state.artifacts, state.reactor.isOverdrive);

        // Update habit
        const updatedHabits = [...state.habits];
        updatedHabits[habitIndex] = {
            ...habit,
            currentStreak: newStreak,
            lastCompleted: now,
            completionHistory: [...habit.completionHistory, now]
        };

        // Update reactor
        const newEnergy = Math.min(state.reactor.maxCapacity, state.reactor.currentEnergy + energyGain);
        const newStability = newEnergy / state.reactor.maxCapacity;

        set({
            habits: updatedHabits,
            reactor: {
                ...state.reactor,
                currentEnergy: newEnergy,
                stability: newStability,
                isCritical: newStability < CRITICAL_THRESHOLD,
                isOverdrive: newStability > OVERDRIVE_THRESHOLD
            }
        });

        // Trigger effects
        if (window.__triggerReactorPulse) window.__triggerReactorPulse();
        if (window.__audioEngine) window.__audioEngine.playCompletionSound(habit.category);

        // Check for artifact unlock
        if (newStreak === 7) {
            get().unlockArtifact(id);
        }

        get().updateModularGeometry();
        get().saveToLocalStorage();
    },

    deleteHabit: (id) => {
        set(state => ({
            habits: state.habits.filter(h => h.id !== id)
        }));
        get().saveToLocalStorage();
    },

    // Reactor Logic
    updateReactorEnergy: () => {
        const state = get();
        const { reactor, artifacts } = state;

        const { energy: newEnergy, stability: newStability } = updateReactorEnergy(
            reactor,
            artifacts
        );

        set({
            reactor: {
                ...reactor,
                currentEnergy: newEnergy,
                stability: newStability,
                isCritical: newStability < CRITICAL_THRESHOLD,
                isOverdrive: newStability > OVERDRIVE_THRESHOLD,
                lastDecayUpdate: new Date()
            }
        });

        // Trigger emergency quests if critical
        if (newStability < CRITICAL_THRESHOLD && state.quests.length === 0) {
            const quest = generateEmergencyQuest();
            get().addQuest(quest);
        }
    },

    enterHibernation: () => set(state => ({
        reactor: { ...state.reactor, isHibernating: true }
    })),

    exitHibernation: () => set(state => ({
        reactor: { ...state.reactor, isHibernating: false }
    })),

    // Artifacts
    unlockArtifact: (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return;

        const newArtifact: Artifact = {
            id: generateId(),
            name: `${habit.category.toUpperCase()} CORE`,
            svgData: '', // To be generated by component or utility
            buffType: habit.category === 'physical' ? 'decay_reduction' :
                habit.category === 'mental' ? 'capacity_boost' :
                    habit.category === 'social' ? 'streak_protection' : 'energy_multiplier',
            buffValue: 0.1,
            category: habit.category,
            unlockedAt: new Date()
        };

        set(state => ({
            artifacts: [...state.artifacts, newArtifact]
        }));

        get().addNotification(`System Upgrade: ${newArtifact.name} Unlocked!`, "success");
        get().updateModularGeometry();
    },

    consumeArtifact: (id) => {
        // Emergency repair
        set(state => ({
            artifacts: state.artifacts.filter(a => a.id !== id),
            reactor: {
                ...state.reactor,
                currentEnergy: state.reactor.maxCapacity * 0.5,
                isCritical: false
            }
        }));
    },

    // Quests
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
        const quest = get().quests.find(q => q.id === id);
        if (!quest) return;

        set(state => ({
            reactor: {
                ...state.reactor,
                currentEnergy: Math.min(state.reactor.maxCapacity, state.reactor.currentEnergy + quest.reward.energy),
                isCritical: quest.reward.exitCritical ? false : state.reactor.isCritical
            },
            quests: state.quests.filter(q => q.id !== id)
        }));

        get().addNotification(`Quest Completed: ${quest.name}`, "success");
        get().saveToLocalStorage();
    },

    // Events
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
        const event = get().events.find(e => e.id === id);
        if (!event) return;

        if (event.reward.energy) {
            set(state => ({
                reactor: {
                    ...state.reactor,
                    currentEnergy: Math.min(state.reactor.maxCapacity, state.reactor.currentEnergy + event.reward.energy!)
                }
            }));
        }

        set(state => ({
            events: state.events.filter(e => e.id !== id)
        }));

        get().addNotification("Orbital Event Claimed", "info");
        get().saveToLocalStorage();
    },

    // Visuals
    updateModularGeometry: () => {
        const state = get();
        set({
            modularGeometry: {
                shieldRings: calculateShieldLevel(state.artifacts.length),
                coolingVentsActive: state.reactor.stability > 0.5,
                emergencyVentsActive: state.reactor.stability < 0.3,
                structuralDamage: state.reactor.stability < 0.1
            }
        });
    },

    // Settings
    toggleEthicalMode: () => set(state => ({
        ethicalSettings: { ...state.ethicalSettings, enabled: !state.ethicalSettings.enabled }
    })),

    toggleSessionOverride: () => set(state => ({
        ethicalSettings: { ...state.ethicalSettings, sessionOverride: !state.ethicalSettings.sessionOverride }
    })),

    // Notifications
    notifications: [],
    addNotification: (message, type) => {
        const id = generateId();
        set(state => ({
            notifications: [...state.notifications.slice(-4), { id, message, type }]
        }));
        setTimeout(() => get().removeNotification(id), 5000);
    },
    removeNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),

    // Persistence
    saveToLocalStorage: () => {
        const { habits, artifacts, reactor, quests, ethicalSettings } = get();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            habits,
            artifacts,
            reactor,
            quests,
            ethicalSettings
        }));
    },

    loadFromLocalStorage: () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                set(parsed);
                // Fix: Ensure dates are valid
                set(state => ({
                    reactor: { ...state.reactor, lastDecayUpdate: new Date(state.reactor.lastDecayUpdate) }
                }));
            } catch (e) {
                console.error("Failed to load state", e);
            }
        }
    }
}));
