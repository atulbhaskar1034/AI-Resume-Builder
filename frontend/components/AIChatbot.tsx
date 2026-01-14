import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, Lightbulb, Target, BookOpen, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const quickActions = [
    { icon: Target, label: 'Resume Tips', color: '#FF6B35' },
    { icon: Lightbulb, label: 'Career Advice', color: '#E040FB' },
    { icon: BookOpen, label: 'Learning Path', color: '#00D9FF' },
];

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredAction, setHoveredAction] = useState<number | null>(null);

    return (
        <>
            {/* Floating trigger button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white z-40 overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E040FB 50%, #00D9FF 100%)' }}
            >
                {/* Shimmer effect */}
                <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                />

                {/* Pulse ring */}
                <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-white/50"
                />

                <MessageSquare className="w-6 h-6 relative z-10" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                    >
                        {/* Gradient Header */}
                        <div
                            className="p-5 flex justify-between items-center text-white relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E040FB 50%, #00D9FF 100%)' }}
                        >
                            {/* Animated particles */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-white rounded-full"
                                    initial={{ x: Math.random() * 100 + '%', y: '100%', opacity: 0.3 }}
                                    animate={{ y: '-100%', opacity: [0.3, 0.8, 0] }}
                                    transition={{
                                        duration: 3 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2,
                                    }}
                                />
                            ))}

                            <div className="flex items-center space-x-3 relative z-10">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                                >
                                    <Bot className="w-5 h-5" />
                                </motion.div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">AI Career Counselor</span>
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-2 h-2 rounded-full bg-green-400"
                                        />
                                    </div>
                                    <span className="text-xs text-white/80">Powered by GPT</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors relative z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="h-72 bg-gray-50 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            {/* Background decoration */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 opacity-5"
                                style={{
                                    background: 'conic-gradient(from 0deg, #FF6B35, #E040FB, #00D9FF, #FF6B35)',
                                }}
                            />

                            {/* Icon with animation */}
                            <motion.div
                                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="relative mb-6"
                            >
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E040FB 50%, #00D9FF 100%)' }}>
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                {/* Glow */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 rounded-2xl blur-xl -z-10"
                                    style={{ background: 'linear-gradient(135deg, #FF6B35, #E040FB)' }}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="font-bold text-xl text-gray-900 mb-2">Coming Soon!</h3>
                                <p className="text-sm text-gray-500 max-w-[220px] mx-auto leading-relaxed">
                                    Our AI career counselor is learning from millions of career paths. Stay tuned!
                                </p>
                            </motion.div>

                            {/* Animated typing dots */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-1 mt-4"
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                        className="w-2 h-2 rounded-full bg-gray-300"
                                    />
                                ))}
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">
                                Quick Actions
                            </p>
                            <div className="flex gap-2">
                                {quickActions.map((action, i) => (
                                    <motion.button
                                        key={action.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        onMouseEnter={() => setHoveredAction(i)}
                                        onMouseLeave={() => setHoveredAction(null)}
                                        whileHover={{ y: -2 }}
                                        className="flex-1 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all text-center"
                                    >
                                        <motion.div
                                            animate={{
                                                rotate: hoveredAction === i ? [0, -10, 10, 0] : 0,
                                                scale: hoveredAction === i ? 1.1 : 1,
                                            }}
                                            className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                                            style={{ backgroundColor: hoveredAction === i ? `${action.color}15` : '#f3f4f6' }}
                                        >
                                            <action.icon
                                                className="w-4 h-4"
                                                style={{ color: hoveredAction === i ? action.color : '#9ca3af' }}
                                            />
                                        </motion.div>
                                        <span className="text-xs font-medium text-gray-600">{action.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100 flex items-center space-x-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    disabled
                                    placeholder="Ask me anything..."
                                    className="w-full bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-0 cursor-not-allowed placeholder-gray-400"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled
                                className="p-3 rounded-xl text-white cursor-not-allowed opacity-60"
                                style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E040FB 100%)' }}
                            >
                                <Send className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
