import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusStore } from '../store/useFocusStore';
import { Target, Timer, MessageCircle, X } from 'lucide-react';

export default function FocusOverlay() {
    const { isFocusMode, toggleFocusMode, timer } = useFocusStore();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isFocusMode && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-between p-12 overflow-hidden"
                >
                    {/* Subtle vignette / focus ring */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />

                    {/* Top Info */}
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="relative z-10 flex items-center gap-8 bg-zinc-900/90 border border-zinc-800 px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl pointer-events-auto"
                    >
                        <div className="flex items-center gap-2">
                            <Timer className="w-5 h-5 text-white animate-pulse" />
                            <span className="text-xl font-mono font-bold w-16">{formatTime(timer)}</span>
                        </div>

                        <div className="w-px h-6 bg-zinc-800" />

                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-[10px] text-zinc-500 uppercase font-black">Focus Mode</p>
                                <p className="text-xs text-white/80">Distraction-free session</p>
                            </div>
                            <button
                                onClick={toggleFocusMode}
                                className="p-2 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Center visual motivator */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-96 h-96 rounded-full border-2 border-white/5 flex items-center justify-center"
                        >
                            <div className="w-64 h-64 rounded-full border border-white/10" />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
