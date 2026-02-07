// Enhanced HUD Overlay with all systems
import { useState } from 'react';
import { ReactorStats } from './ReactorStats';
import { HabitList } from './HabitList';
import { ModulesGrid } from './ModulesGrid';
import { OracleAlert } from './OracleAlert';
import { AsteroidAlert } from './AsteroidAlert';
import { QuestPanel } from './QuestPanel';
import { AudioControls } from './AudioControls';
import { EthicalControls } from './EthicalControls';
import { AuthModal } from './AuthModal';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useAuth } from '@/contexts/AuthContext';

import { SyncStatusIndicator } from './SyncStatusIndicator';
import { NotificationContainer } from './NotificationContainer';
import { useAuth } from '@/contexts/AuthContext';

export const HUDOverlay = () => {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { user, signOut } = useAuth();

    return (
        <div className="fixed inset-0 pointer-events-none flex flex-col p-6 gap-6">
            <SyncStatusIndicator />
            <NotificationContainer />
            {/* Top Bar */}
            <div className="pointer-events-auto flex justify-between items-start gap-6">
                <div className="hud-panel flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="font-orbitron text-2xl font-bold text-cyber-400 mb-2">
                                CORE: IGNITION
                            </h1>
                            <p className="text-sm text-gray-400">
                                Reactor Status: <span className="text-cyan-400">ONLINE</span>
                            </p>
                        </div>

                        {/* Auth Button */}
                        <div className="flex flex-col items-end gap-2">
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-green-400">
                                        CMDR {user.email?.split('@')[0].toUpperCase()}
                                    </span>
                                    <button
                                        onClick={() => signOut()}
                                        className="px-2 py-1 bg-red-900/30 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-900/50 rounded transition-colors"
                                    >
                                        LOGOUT
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 text-xs text-cyan-400 hover:bg-cyan-900/50 rounded transition-colors font-bold animate-pulse"
                                >
                                    CONNECT UPLINK
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <ReactorStats />

                <div className="flex flex-col gap-2">
                    <AudioControls />
                    <EthicalControls />
                </div>
            </div>

            {/* Alerts Layer */}
            <div className="pointer-events-auto relative z-50">
                <OracleAlert />
                <AsteroidAlert />
                <QuestPanel />
                <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 pointer-events-auto overflow-hidden">
                {/* Left Panel - Habits */}
                <div className="w-96 flex flex-col">
                    <HabitList />
                </div>

                {/* Center - Reactor (3D scene visible through) */}
                <div className="flex-1 pointer-events-none" />

                {/* Right Panel - Modules */}
                <div className="w-80 flex flex-col">
                    <ModulesGrid />
                </div>
            </div>
        </div>
    );
};
