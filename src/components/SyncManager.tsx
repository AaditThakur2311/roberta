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


    // Pull data on mount if logged in
    useEffect(() => {
        if (!user || !supabase) return;

        const loadRemoteData = async () => {
            console.log('SyncManager: Pulling data...');
            // In a real implementation with granular tables, we would fetch habits, artifacts etc.
            // For complexity reasons in this V1, we might assume a 'user_settings' table blob
            // But per schema, we have `habits`, `artifacts` etc.

            // Example fetch:
            /*
            const { data: habits } = await supabase.from('habits').select('*').eq('user_id', user.id);
            if (habits && habits.length > 0) {
                 // Merge logic...
            }
            */

            // Getting ready for sync...
        };

        if (isFirstLoad.current) {
            loadRemoteData();
            isFirstLoad.current = false;
        }
    }, [user]);

    // Push data on changes (Debounced)
    useEffect(() => {
        if (!user || !supabase) return;

        const syncData = async (state: CoreStore) => {
            if (!user || !supabase) return;

            useStore.getState().setSyncStatus('syncing');

            try {
                // 1. Fetch remote state first (Optimistic Locking / Merging)
                const { data: remoteData, error: fetchError } = await supabase
                    .from('user_data')
                    .select('habits, artifacts, updated_at')
                    .eq('user_id', user.id)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "No rows" error
                    throw fetchError;
                }

                let habitsToSave = state.habits;
                // let artifactsToSave = state.artifacts; // (Unused for now)

                // 2. Merge if remote data exists
                if (remoteData) {
                    const remoteHabits = JSON.parse(remoteData.habits || '[]') as any[];

                    // Merge Habits: Union by ID, merge histories
                    habitsToSave = state.habits.map(localH => {
                        const remoteH = remoteHabits.find((rh: any) => rh.id === localH.id);
                        if (!remoteH) return localH;

                        // Merge completion history (Union of unique dates)
                        const localHistory = new Set(localH.completionHistory.map((d: any) => new Date(d).toISOString()));
                        const remoteHistory = remoteH.completionHistory.map((d: any) => new Date(d).toISOString());

                        remoteHistory.forEach((d: string) => localHistory.add(d));

                        const mergedHistory = Array.from(localHistory).map(d => new Date(d));

                        // Recalculate streak based on merged history? 
                        // For simplicity, take the max streak or trust local if strictly adding.
                        // Let's trust local for streak logic to avoid complex recalc here, 
                        // but ideally we should recalc. 
                        // We will just save the merged history.

                        return {
                            ...localH,
                            completionHistory: mergedHistory,
                            // Keep local streak increment logic for now, or use Math.max
                            currentStreak: Math.max(localH.currentStreak, remoteH.currentStreak || 0)
                        };
                    });

                    // Add habits that are on remote but not local (New device sync)
                    const localIds = new Set(state.habits.map(h => h.id));
                    const newRemoteHabits = remoteHabits.filter((rh: any) => !localIds.has(rh.id));
                    habitsToSave = [...habitsToSave, ...newRemoteHabits];
                }

                // 3. Push Merged State
                const { error } = await supabase
                    .from('user_data')
                    .upsert({
                        user_id: user.id,
                        habits: JSON.stringify(habitsToSave),
                        artifacts: JSON.stringify(state.artifacts), // Simple overwrite for artifacts for now (rarely change)
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;

                // 4. Update Local Store with Merged Data (to reflect what is now server truth)
                // We should technically update the store if we found new remote habits
                // But triggering a set inside a subscribe callback might loop?
                // For now, we only push. True bi-di sync requires more rigorous structure.

                useStore.getState().setSyncStatus('synced');

            } catch (error: any) {
                console.error('Sync failed:', error);
                useStore.getState().setSyncStatus('error', error.message);
            }
        };

        const debouncedSync = debounce(syncData, 2000);

        // Subscribe to store changes
        const unsub = useStore.subscribe((state) => {
            debouncedSync(state);
        });

        return () => {
            unsub();
        };
    }, [user]);

    // Flush on unload
    useEffect(() => {
        const handleUnload = () => {
            const state = useStore.getState();
            if (state.syncState.status === 'syncing' || state.syncState.status === 'idle') {
                // Best effort sync
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    return null;
};
