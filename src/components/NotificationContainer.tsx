import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationContainer = () => {
    const notifications = useStore(state => state.notifications);
    const removeNotification = useStore(state => state.removeNotification);

    return (
        <div className="absolute top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map(n => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className={`pointer-events-auto max-w-sm p-4 rounded border font-mono text-sm shadow-lg backdrop-blur-md
                            ${n.type === 'critical' ? 'bg-red-900/80 border-red-500 text-red-100' :
                                n.type === 'error' ? 'bg-orange-900/80 border-orange-500 text-orange-100' :
                                    n.type === 'success' ? 'bg-green-900/80 border-green-500 text-green-100' :
                                        'bg-cyan-900/80 border-cyan-500 text-cyan-100'}
                        `}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <span>{n.message}</span>
                            <button
                                onClick={() => removeNotification(n.id)}
                                className="text-xs opacity-50 hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
