// Enhanced App.tsx with Onboarding
import { useState, useEffect } from 'react';
import { ReactorCanvas } from './components/ReactorCanvas';
import { HUDOverlay } from './components/HUDOverlay';
import { OnboardingSequence } from './components/OnboardingSequence';
import { useStore } from './store/useStore';

function App() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const loadFromLocalStorage = useStore(state => state.loadFromLocalStorage);

    useEffect(() => {
        // Load saved state
        loadFromLocalStorage();

        // Check if user has completed onboarding
        const hasOnboarded = localStorage.getItem('core-ignition-onboarded');
        if (!hasOnboarded) {
            setShowOnboarding(true);
        }
    }, [loadFromLocalStorage]);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <ReactorCanvas />
            <HUDOverlay />

            {showOnboarding && (
                <OnboardingSequence onComplete={() => setShowOnboarding(false)} />
            )}
        </div>
    );
}

export default App;
