import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { CoreStore } from '@/types';

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: any;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export const SyncManager = () => {
    const { user } = useAuth();
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (!user || !supabase) return;

        const loadRemoteData = async () => {
            console.log('SyncManager: Initializing...');
        };

        if (isFirstLoad.current) {
            loadRemoteData();
            isFirstLoad.current = false;
        }
    }, [user]);

    useEffect(() => {
        if (!user || !supabase) return;

        const syncData = async (state: CoreStore) => {
            if (!user || !supabase) return;

            useStore.getState().setSyncStatus('syncing');

            try {
                const { data: remoteData, error: fetchError } = await supabase
                    .from('user_data')
                    .select('habits, artifacts, updated_at')
                    .eq('user_id', user.id)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') {
                    throw fetchError;
                }

                let habitsToSave = state.habits;

                if (remoteData) {
                    const remoteHabits = JSON.parse(remoteData.habits || '[]') as any[];

                    habitsToSave = state.habits.map(localH => {
                        const remoteH = remoteHabits.find((rh: any) => rh.id === localH.id);
                        if (!remoteH) return localH;

                        const localHistory = new Set(localH.completionHistory.map((d: any) => new Date(d).toISOString()));
                        const remoteHistory = remoteH.completionHistory.map((d: any) => new Date(d).toISOString());

                        remoteHistory.forEach((d: string) => localHistory.add(d));

                        const mergedHistory = Array.from(localHistory).map(d => new Date(d));

                        return {
                            ...localH,
                            completionHistory: mergedHistory,
                            currentStreak: Math.max(localH.currentStreak, remoteH.currentStreak || 0)
                        };
                    });

                    const localIds = new Set(state.habits.map(h => h.id));
                    const newRemoteHabits = remoteHabits.filter((rh: any) => !localIds.has(rh.id));
                    habitsToSave = [...habitsToSave, ...newRemoteHabits];
                }

                const { error } = await supabase
                    .from('user_data')
                    .upsert({
                        user_id: user.id,
                        habits: JSON.stringify(habitsToSave),
                        artifacts: JSON.stringify(state.artifacts),
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;
                useStore.getState().setSyncStatus('synced');

            } catch (error: any) {
                console.error('Sync failed:', error);
                useStore.getState().setSyncStatus('error', error.message);
            }
        };

        const debouncedSync = debounce(syncData, 2000);

        const unsub = useStore.subscribe((state) => {
            debouncedSync(state);
        });

        return () => {
            unsub();
        };
    }, [user]);

    useEffect(() => {
        const handleUnload = () => {
            const state = useStore.getState();
            if (state.syncState.status === 'syncing' || state.syncState.status === 'idle') {
                // Best effort
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    return null;
};
