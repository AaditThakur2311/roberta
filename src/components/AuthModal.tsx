import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { isBackendConfigured } from '@/lib/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const { signInWithEmail, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await signInWithEmail(email);
            setStatus('sent');
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Failed to send login link');
        }
    };

    if (!isOpen) return null;

    if (!isBackendConfigured()) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="hud-panel max-w-md w-full border-red-500/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-orbitron font-bold text-red-400">OFFLINE MODE</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                        Backend connection is not configured.
                        The application is running in persistent local storage mode.
                        <br /><br />
                        To enable cloud sync, please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-cyan-400 font-orbitron font-bold"
                    >
                        ACKNOWLEDGE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <AnimatePresence>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="hud-panel max-w-md w-full border-cyan-500/50 relative overflow-hidden"
                >
                    {/* Decorative Scanner Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 animate-pulse" />

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-orbitron font-bold text-xl text-cyan-400">IDENTIFICATION</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
                    </div>

                    {status === 'sent' ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">📧</div>
                            <h3 className="font-orbitron font-bold text-green-400 mb-2">LINK TRANSMITTED</h3>
                            <p className="text-sm text-gray-300">
                                Check your comms (email) for the access key.
                                <br />You may close this window.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-orbitron text-gray-400 mb-1">USER ID (EMAIL)</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 focus:border-cyan-500 rounded p-3 text-white outline-none font-mono"
                                    placeholder="commander@core.net"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-xs">
                                    ❌ {errorMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'sending' || loading}
                                className="w-full py-3 bg-cyan-900/50 hover:bg-cyan-800/50 border border-cyan-500/50 hover:border-cyan-400 rounded text-cyan-300 font-orbitron font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {status === 'sending' ? (
                                    <span className="animate-pulse">TRANSMITTING...</span>
                                ) : (
                                    <span className="group-hover:tracking-widest transition-all duration-300">INITIATE LINK</span>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
