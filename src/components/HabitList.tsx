// Habit List - Scrollable list of habits with checkboxes
import { useStore } from '@/store/useStore';
import { HabitItem } from './HabitItem';

export const HabitList = () => {
    const habits = useStore(state => state.habits);

    // Group by category
    const groupedHabits = habits.reduce((acc, habit) => {
        if (!acc[habit.category]) {
            acc[habit.category] = [];
        }
        acc[habit.category].push(habit);
        return acc;
    }, {} as Record<string, typeof habits>);

    const categoryLabels: Record<string, string> = {
        physical: 'PHYSICAL',
        mental: 'MENTAL',
        social: 'SOCIAL',
        creative: 'CREATIVE'
    };

    const categoryColors: Record<string, string> = {
        physical: 'text-red-400',
        mental: 'text-blue-400',
        social: 'text-green-400',
        creative: 'text-purple-400'
    };

    return (
        <div className="hud-panel flex flex-col h-full">
            <h3 className="font-orbitron text-lg font-bold text-cyber-400 mb-4">
                HABITS
            </h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {Object.entries(groupedHabits).map(([category, categoryHabits]) => (
                    <div key={category}>
                        <h4 className={`font-orbitron text-sm font-bold mb-2 ${categoryColors[category]}`}>
                            {categoryLabels[category]}
                        </h4>
                        <div className="space-y-2">
                            {categoryHabits.map(habit => (
                                <HabitItem key={habit.id} habit={habit} />
                            ))}
                        </div>
                    </div>
                ))}

                {habits.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                        No habits yet. Add one to get started!
                    </p>
                )}
            </div>
        </div>
    );
};
