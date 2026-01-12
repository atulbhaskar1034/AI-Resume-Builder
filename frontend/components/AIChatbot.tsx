import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-llama-indigo-600 to-llama-purple-600 rounded-full shadow-xl flex items-center justify-center text-white z-40 hover:shadow-2xl transition-shadow"
            >
                <MessageSquare className="w-6 h-6" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-llama-indigo-600 to-llama-purple-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                <span className="font-semibold">AI Career Counselor</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area (Placeholder) */}
                        <div className="h-80 bg-slate-50 p-4 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-8 h-8 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700">Coming Soon!</h3>
                                <p className="text-sm text-slate-500 max-w-[200px] mx-auto mt-2">
                                    Our interactive AI career counselor is currently in training. Stay tuned for real-time career advice.
                                </p>
                            </div>
                        </div>

                        {/* Input (Disabled) */}
                        <div className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
                            <input
                                type="text"
                                disabled
                                placeholder="Ask me anything about your career..."
                                className="flex-1 bg-slate-50 border-0 rounded-lg px-4 py-2 text-sm focus:ring-0 cursor-not-allowed"
                            />
                            <button disabled className="p-2 bg-slate-100 rounded-lg text-slate-400 cursor-not-allowed">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
