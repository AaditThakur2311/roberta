// Audio Controls - UI component for audio settings
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioEngine } from '@/utils/audioEngine';
import { useStore } from '@/store/useStore';

export const AudioControls = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const stability = useStore(state => state.reactor.stability);

    useEffect(() => {
        if (isEnabled) {
            audioEngine.initialize().then(() => {
                audioEngine.startReactorHum(stability);
            });
        } else {
            audioEngine.stopReactorHum();
        }
    }, [isEnabled]);

    useEffect(() => {
        if (isEnabled) {
            audioEngine.updateReactorPitch(stability);
        }
    }, [stability, isEnabled]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioEngine.setVolume(newVolume);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hud-panel w-64"
        >
            <h4 className="font-orbitron text-sm font-bold text-cyber-400 mb-3">
                AUDIO SYSTEM
            </h4>

            <div className="space-y-3">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Reactor Hum</span>
                    <button
                        onClick={() => setIsEnabled(!isEnabled)}
                        className={`px-3 py-1 rounded text-xs font-orbitron transition-all ${isEnabled
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                                : 'bg-gray-800 text-gray-500 border border-gray-700'
                            }`}
                    >
                        {isEnabled ? 'ON' : 'OFF'}
                    </button>
                </div>

                {/* Volume Slider */}
                {isEnabled && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Volume</span>
                            <span className="text-xs text-cyan-400">{Math.round(volume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>
                )}

                {/* Pitch Indicator */}
                {isEnabled && (
                    <div className="text-xs text-gray-500">
                        Pitch: {Math.round(40 + stability * 40)}Hz
                    </div>
                )}
            </div>
        </motion.div>
    );
};
