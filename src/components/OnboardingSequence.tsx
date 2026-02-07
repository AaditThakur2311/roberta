// Onboarding Sequence - Interactive "Ignition Sequence"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import type { HabitCategory } from '@/types';

interface OnboardingProps {
    onComplete: () => void;
}

export const OnboardingSequence = ({ onComplete }: OnboardingProps) => {
    const [step, setStep] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState<HabitCategory[]>([]);
    const addHabit = useStore(state => state.addHabit);

    const steps = [
        {
            title: 'CORE: IGNITION',
            subtitle: 'Reactor Initialization Sequence',
            content: 'Welcome, Commander. Your personal reactor core awaits activation. This system gamifies your daily habits as fuel for a starship reactor.',
            action: 'BEGIN IGNITION'
        },
        {
            title: 'SELECT SYSTEMS',
            subtitle: 'Choose Your Focus Areas',
            content: 'Which life systems require maintenance? Select all that apply:',
            action: 'CONFIRM SELECTION'
        },
        {
            title: 'CORE ONLINE',
            subtitle: 'Reactor Status: ACTIVE',
            content: 'Your reactor is now online. Complete habits to generate energy. Maintain streaks to unlock artifacts. The core awaits your command.',
            action: 'LAUNCH INTERFACE'
        }
    ];

    const categories: { id: HabitCategory; name: string; icon: string; color: string }[] = [
        { id: 'physical', name: 'Physical Systems', icon: '💪', color: '#ff6b6b' },
        { id: 'mental', name: 'Mental Processors', icon: '🧠', color: '#4dabf7' },
        { id: 'social', name: 'Social Networks', icon: '👥', color: '#51cf66' },
        { id: 'creative', name: 'Creative Engines', icon: '🎨', color: '#cc5de8' }
    ];

    const handleNext = () => {
        if (step === 1) {
            // Create starter habits for selected categories
            selectedCategories.forEach(category => {
                const starterHabits: Record<HabitCategory, string> = {
                    physical: 'Morning Exercise',
                    mental: 'Daily Reading',
                    social: 'Connect with Friend',
                    creative: 'Creative Practice'
                };

                addHabit({
                    name: starterHabits[category],
                    category,
                    frequency: 'daily'
                });
            });
        }

        if (step === steps.length - 1) {
            localStorage.setItem('core-ignition-onboarded', 'true');
            onComplete();
        } else {
            setStep(step + 1);
        }
    };

    const toggleCategory = (cat: HabitCategory) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const canProceed = step !== 1 || selectedCategories.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="max-w-2xl w-full mx-4"
                >
                    <div className="hud-panel border-2 border-cyan-500/50">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.h1
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                className="font-orbitron text-4xl font-bold text-cyan-400 mb-2"
                            >
                                {steps[step].title}
                            </motion.h1>
                            <p className="text-sm text-gray-400 font-mono">
                                {steps[step].subtitle}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="mb-8">
                            <p className="text-gray-300 text-center mb-6">
                                {steps[step].content}
                            </p>

                            {/* Category Selection (Step 1) */}
                            {step === 1 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {categories.map(cat => (
                                        <motion.button
                                            key={cat.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`p-4 rounded border-2 transition-all ${selectedCategories.includes(cat.id)
                                                    ? 'border-cyan-500 bg-cyan-500/20'
                                                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                                }`}
                                            style={{
                                                borderColor: selectedCategories.includes(cat.id) ? cat.color : undefined
                                            }}
                                        >
                                            <div className="text-3xl mb-2">{cat.icon}</div>
                                            <div className="font-orbitron text-sm font-bold" style={{ color: cat.color }}>
                                                {cat.name}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex justify-center gap-2 mb-6">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 w-12 rounded ${i === step ? 'bg-cyan-500' : i < step ? 'bg-cyan-700' : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Action Button */}
                        <motion.button
                            whileHover={{ scale: canProceed ? 1.02 : 1 }}
                            whileTap={{ scale: canProceed ? 0.98 : 1 }}
                            onClick={handleNext}
                            disabled={!canProceed}
                            className={`w-full py-3 rounded font-orbitron font-bold transition-all ${canProceed
                                    ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {steps[step].action}
                        </motion.button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
