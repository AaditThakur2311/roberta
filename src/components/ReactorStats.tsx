// Reactor Stats - Energy, Stability, Shield Level display
import { useStore } from '@/store/useStore';

export const ReactorStats = () => {
    const { currentEnergy, maxCapacity, stability, shieldLevel, isCritical, isOverdrive } = useStore(
        state => state.reactor
    );

    const stabilityPercent = Math.round(stability * 100);

    // Determine status color
    let statusColor = 'text-cyber-400';
    let statusText = 'STABLE';

    if (isOverdrive) {
        statusColor = 'text-white';
        statusText = 'OVERDRIVE';
    } else if (isCritical) {
        statusColor = 'text-red-500';
        statusText = 'CRITICAL';
    } else if (stability < 0.5) {
        statusColor = 'text-orange-400';
        statusText = 'UNSTABLE';
    }

    return (
        <div className="hud-panel w-80">
            <h3 className="font-orbitron text-lg font-bold text-cyber-400 mb-4">
                REACTOR STATUS
            </h3>

            {/* Status */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className={`font-orbitron font-bold ${statusColor}`}>
                        {statusText}
                    </span>
                </div>
            </div>

            {/* Energy */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Energy</span>
                    <span className="text-sm font-mono">
                        {Math.round(currentEnergy)} / {maxCapacity}
                    </span>
                </div>
                <div className="energy-bar">
                    <div
                        className="energy-bar-fill"
                        style={{ width: `${stabilityPercent}%` }}
                    />
                </div>
            </div>

            {/* Stability */}
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Stability</span>
                    <span className="text-sm font-mono text-cyan-400">
                        {stabilityPercent}%
                    </span>
                </div>
            </div>

            {/* Shield Level */}
            <div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Shield Level</span>
                    <span className="text-sm font-mono text-blue-400">
                        {shieldLevel}
                    </span>
                </div>
            </div>
        </div>
    );
};
