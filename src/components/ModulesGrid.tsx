// Modules Grid - Display procedural artifacts with buffs
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

export const ModulesGrid = () => {
    const artifacts = useStore(state => state.artifacts);

    const buffDescriptions: Record<string, string> = {
        decay_reduction: 'Reduces energy decay',
        capacity_boost: 'Increases max capacity',
        streak_protection: 'Protects one streak break',
        energy_multiplier: 'Boosts energy gain'
    };

    return (
        <div className="hud-panel h-full flex flex-col">
            <h3 className="font-orbitron text-lg font-bold text-cyber-400 mb-4">
                MODULES
            </h3>

            {artifacts.length === 0 ? (
                <p className="text-sm text-gray-400">
                    Achieve 7-day streaks to unlock modules
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto custom-scrollbar">
                    {artifacts.map((artifact, index) => (
                        <motion.div
                            key={artifact.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative p-3 rounded bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer"
                        >
                            {/* SVG Artifact */}
                            <div
                                className="w-full aspect-square mb-2"
                                dangerouslySetInnerHTML={{ __html: artifact.svgData }}
                            />

                            {/* Name */}
                            <div className="text-xs font-orbitron text-cyan-400 mb-1">
                                {artifact.name}
                            </div>

                            {/* Buff */}
                            <div className="text-xs text-gray-400">
                                {buffDescriptions[artifact.buffType]}: +{artifact.buffValue * 100}%
                            </div>

                            {/* Tooltip on hover */}
                            <div className="absolute inset-0 bg-gray-950/95 rounded p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="text-xs space-y-2">
                                    <div className="font-orbitron text-cyan-400">{artifact.name}</div>
                                    <div className="text-gray-300">
                                        {buffDescriptions[artifact.buffType]}
                                    </div>
                                    <div className="text-gray-500">
                                        Category: {artifact.category}
                                    </div>
                                    <div className="text-gray-500">
                                        Unlocked: {new Date(artifact.unlockedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
