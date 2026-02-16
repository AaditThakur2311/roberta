import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export const SyncStatusIndicator = () => {
    const { status } = useStore(state => state.syncState);

    if (status === 'idle') return null;

    return (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 pointer-events-none">
            <AnimatePresence>
                {status === 'syncing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur rounded-full border border-cyan-900"
                    >
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] uppercase text-cyan-500 font-mono tracking-wider">Uplink Active</span>
                    </motion.div>
                )}

                {status === 'synced' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: 2 }} // Stay for 2s
                        className="flex items-center gap-2 px-3 py-1 bg-green-900/20 backdrop-blur rounded-full border border-green-800"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] uppercase text-green-500 font-mono tracking-wider">Data Secured</span>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-3 py-1 bg-red-900/50 backdrop-blur rounded-full border border-red-500"
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] uppercase text-red-500 font-mono tracking-wider">Uplink Failed</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
