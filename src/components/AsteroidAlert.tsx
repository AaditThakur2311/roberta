// Asteroid Alert - HUD popup for incoming events
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getEventColor } from '@/utils/eventGenerator';

export const AsteroidAlert = () => {
    const events = useStore(state => state.events.filter(e => !e.claimed && new Date(e.expiresAt) > new Date()));
    const claimEvent = useStore(state => state.claimEvent);

    if (events.length === 0) return null;

    return (
        <div className="absolute top-24 right-6 w-80 pointer-events-auto flex flex-col gap-2">
            <AnimatePresence>
                {events.map(event => (
                    <EventToast
                        key={event.id}
                        event={event}
                        onClaim={() => claimEvent(event.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const EventToast = ({ event, onClaim }: { event: any, onClaim: () => void }) => {
    const color = getEventColor(event.eventType);

    // Play sound on mount
    useEffect(() => {
        if ((window as any).__audioEngine) {
            // TODO: Add specific event sound
            (window as any).__audioEngine.playCompletionSound('creative');
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="hud-panel cursor-pointer hover:bg-white/5 transition-colors border-l-4"
            style={{ borderColor: color }}
            onClick={onClaim}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-orbitron font-bold text-sm" style={{ color }}>
                    INCOMING EVENT
                </h4>
                <span className="text-[10px] text-gray-400 font-mono">
                    {Math.round((new Date(event.expiresAt).getTime() - Date.now()) / 1000)}s
                </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 capitalize">
                {event.eventType.replace('_', ' ')} detected
            </p>
            <div className="text-[10px] text-cyan-400 mt-2 font-mono">
                [CLICK TO CLAIM]
            </div>
        </motion.div>
    );
};
