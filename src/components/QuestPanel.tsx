// Quest Panel - Displays active emergency quests
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export const QuestPanel = () => {
    const quests = useStore(state => state.quests.filter(q => !q.completed && new Date(q.expiresAt) > new Date()));


    if (quests.length === 0) return null;

    return (
        <div className="absolute top-24 left-6 w-80 pointer-events-auto flex flex-col gap-2">
            <AnimatePresence>
                {quests.map(quest => (
                    <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="hud-panel border-l-4 border-red-500 bg-red-900/10"
                    >
                        <div className="flex justify-between items-start">
                            <h4 className="font-orbitron font-bold text-sm text-red-500 animate-pulse">
                                ⚠ PRIORITY MISSION
                            </h4>
                            <span className="text-[10px] text-red-400 font-mono">
                                {Math.round((new Date(quest.expiresAt).getTime() - Date.now()) / 1000 / 60)}m left
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{quest.name}</h3>
                        <p className="text-xs text-gray-300 mt-1">
                            {quest.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-3 relative h-1 bg-red-900/50 rounded overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-300"
                                style={{ width: `${(quest.progress / (quest.requirements.habitCount || 1)) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>Progress: {quest.progress}/{quest.requirements.habitCount}</span>
                            <span>Reward: +{quest.reward.energy} Energy</span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
