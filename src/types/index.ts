// Type definitions for CORE: IGNITION

export type HabitCategory = 'physical' | 'mental' | 'social' | 'creative';
export type HabitFrequency = 'daily' | 'weekly';
export type BuffType = 'decay_reduction' | 'capacity_boost' | 'streak_protection' | 'energy_multiplier';
export type QuestType = 'awakening' | 'rapid_stabilization' | 'core_reboot' | 'auxiliary_power' | 'meltdown_prevention' | 'emergency_boost' | 'repair';
export type EventType = 'energy_surge' | 'artifact_fragment' | 'time_dilation' | 'quantum_flux';

export interface Habit {
    id: string;
    name: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    currentStreak: number;
    lastCompleted: Date | null;
    completionHistory: Date[];
    createdAt: Date;
}

export interface Artifact {
    id: string;
    name: string;
    svgData: string;
    buffType: BuffType;
    buffValue: number;
    category: HabitCategory;
    unlockedAt: Date;
}

export interface ReactorState {
    currentEnergy: number;
    maxCapacity: number;
    stability: number;        // Computed: currentEnergy / maxCapacity
    shieldLevel: number;
    isCritical: boolean;
    isHibernating: boolean;
    isOverdrive: boolean;
    lastDecayUpdate: Date;
}

export interface Quest {
    id: string;
    type: QuestType;
    name: string;
    description: string;
    requirements: {
        habitCount?: number;
        category?: string;
        timeLimit?: number;
    };
    reward: {
        energy: number;
        buff?: string;
        exitCritical?: boolean;
    };
    progress: number;
    expiresAt: Date;
    completed: boolean;
}

export interface AsteroidEvent {
    id: string;
    eventType: EventType;
    reward: {
        energy?: number;
        artifactProgress?: number;
        decayPause?: number;
        buff?: string;
    };
    triggeredAt: Date;
    expiresAt: Date;
    claimed: boolean;
}

export interface ModularGeometryState {
    shieldRings: number;           // 0-3
    coolingVentsActive: boolean;
    emergencyVentsActive: boolean;
    structuralDamage: boolean;
}

export interface EthicalBalanceSettings {
    enabled: boolean;
    dailyCap: number;
    cooldownReminderMinutes: number;
    sessionOverride: boolean;
}

export interface CoreStore {
    // State
    habits: Habit[];
    artifacts: Artifact[];
    reactor: ReactorState;
    quests: Quest[];
    events: AsteroidEvent[];
    ethicalSettings: EthicalBalanceSettings;
    modularGeometry: ModularGeometryState;

    // System State
    syncState: {
        status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
        lastSyncedAt: Date | null;
        errorMessage: string | null;
    };

    // Actions
    setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline', msg?: string) => void;
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'lastCompleted' | 'completionHistory'>) => void;
    completeHabit: (id: string) => void;
    deleteHabit: (id: string) => void;

    updateReactorEnergy: () => void;
    enterHibernation: () => void;
    exitHibernation: () => void;

    unlockArtifact: (habitId: string) => void;
    consumeArtifact: (id: string) => void;

    addQuest: (quest: Omit<Quest, 'id'>) => void;
    completeQuest: (id: string) => void;

    spawnEvent: (event: Omit<AsteroidEvent, 'id'>) => void;
    claimEvent: (id: string) => void;

    updateModularGeometry: () => void;

    toggleEthicalMode: () => void;
    toggleSessionOverride: () => void;

    // Persistence
    saveToLocalStorage: () => void;
    loadFromLocalStorage: () => void; // Notifications
    notifications: { id: string; message: string; type: 'success' | 'error' | 'info' | 'critical' }[];
    addNotification: (message: string, type: 'success' | 'error' | 'info' | 'critical') => void;
    removeNotification: (id: string) => void;
}
