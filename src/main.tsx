import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useStore } from './store/useStore'
import { demoHabits, demoArtifacts, demoReactor } from './data/demoState'
import './utils/screenShake'
import { AuthProvider } from './contexts/AuthContext'

// Load demo data on first run
const initializeApp = () => {
    const store = useStore.getState();

    // Check if there's saved data
    store.loadFromLocalStorage();

    // If no data, load demo
    if (store.habits.length === 0) {
        useStore.setState({
            habits: demoHabits,
            artifacts: demoArtifacts,
            reactor: demoReactor
        });
        store.updateModularGeometry();
        store.saveToLocalStorage();
    }
};

initializeApp();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>,
)
