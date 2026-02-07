// Oracle Alert - Warning transmission HUD component
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useOracle } from '@/utils/useOracle';

export const OracleAlert = () => {
    const habits = useStore(state => state.habits);
    const analysis = useOracle(habits);

    if (!analysis || analysis.trend === 'stable' || analysis.trend === 'improving') {
        return null;
    }

    const isCritical = analysis.trend === 'critical';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`hud-panel ${isCritical ? 'border-l-4 border-red-500' : 'border-l-4 border-orange-500'}`}
            >
                <div className="flex items-start gap-3">
                    <div className={`text-2xl ${isCritical ? 'animate-pulse' : ''}`}>
                        {isCritical ? '🚨' : '⚠️'}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-orbitron text-sm font-bold mb-1 text-orange-400">
                            ORACLE TRANSMISSION
                        </h4>
                        <p className="text-sm text-gray-300 mb-2">
                            {analysis.message}
                        </p>
                        <p className="text-xs text-cyan-400">
                            → {analysis.suggestedAction}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                            Confidence: {Math.round(analysis.confidence * 100)}%
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
