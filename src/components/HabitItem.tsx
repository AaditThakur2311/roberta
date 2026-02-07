// Habit Item - Individual habit with checkbox and streak counter
import { motion } from 'framer-motion';
import type { Habit } from '@/types';
import { useStore } from '@/store/useStore';

interface HabitItemProps {
    habit: Habit;
}

export const HabitItem = ({ habit }: HabitItemProps) => {
    const completeHabit = useStore(state => state.completeHabit);

    const handleComplete = () => {
        completeHabit(habit.id);
    };

    // Check if completed today
    const isCompletedToday = !!(habit.lastCompleted &&
        new Date(habit.lastCompleted).toDateString() === new Date().toDateString());

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded bg-gray-900/50 border border-gray-800 hover:border-cyber-500/50 transition-all"
        >
            {/* Custom Checkbox */}
            <button
                onClick={() => completeHabit(habit.id)}
                disabled={isCompletedToday}
                aria-label={`Complete habit ${habit.name}`}
                className={`flex-shrink-0 w-8 h-8 rounded border transition-all duration-300 flex items-center justify-center
                    ${isCompletedToday
                        ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                        : 'bg-transparent border-gray-600 hover:border-cyan-500 text-transparent'
                    }
                `}
            >    {isCompletedToday && (
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )}
            </button>

            {/* Habit Info */}
            <div className="flex-1">
                <div className="text-sm font-medium text-gray-200">
                    {habit.name}
                </div>
                <div className="text-xs text-gray-500">
                    {habit.frequency}
                </div>
            </div>

            {/* Streak Badge */}
            {habit.currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/20 border border-orange-500/50">
                    <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-mono text-orange-400">
                        {habit.currentStreak}
                    </span>
                </div>
            )}
        </motion.div>
    );
};
