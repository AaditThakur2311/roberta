// Ethical Controls - Manage balance settings
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export const EthicalControls = () => {
    const { enabled, dailyCap, sessionOverride } = useStore(state => state.ethicalSettings);
    // Since we can't easily add actions to the store without rewriting it, 
    // we'll assume the store has a toggle action or we'll add it.
    // For now, let's just render the UI state.

    // Note: We need to implement the toggle action in useStore.ts

    if (!enabled && !sessionOverride) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hud-panel w-full"
        >
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-orbitron text-sm font-bold text-green-400">
                    ETHICAL PROTOCOLS
                </h4>
                <div className="px-2 py-0.5 rounded bg-green-900/30 border border-green-500/30 text-[10px] text-green-400">
                    ACTIVE
                </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between">
                    <span>Daily Output Cap:</span>
                    <span className="text-white">{dailyCap} habits</span>
                </div>

                {sessionOverride ? (
                    <div className="p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-yellow-200">
                        ⚠ Safety Limits Overridden for Session
                    </div>
                ) : (
                    <button
                        className="w-full py-1 mt-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors text-[10px]"
                        onClick={() => {
                            // TODO: Implement override trigger
                            if ((window as any).__toggleEthicalOverride) {
                                (window as any).__toggleEthicalOverride();
                            }
                        }}
                    >
                        REQUEST LIMIT OVERRIDE
                    </button>
                )}
            </div>
        </motion.div>
    );
};
