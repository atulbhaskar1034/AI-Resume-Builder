import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Brain, Target, BarChart3, GraduationCap, Sparkles } from 'lucide-react';

interface AnimatedWorkflowProps {
    isProcessing: boolean;
    currentStep: number;
}

const stages = [
    {
        id: 0,
        icon: FileText,
        label: 'Parse',
        description: 'Extracting text from document',
        color: '#FF6B35'
    },
    {
        id: 1,
        icon: Search,
        label: 'Extract',
        description: 'Identifying skills & experience',
        color: '#FF8E72'
    },
    {
        id: 2,
        icon: Brain,
        label: 'Analyze',
        description: 'Semantic embedding analysis',
        color: '#E040FB'
    },
    {
        id: 3,
        icon: Target,
        label: 'Match',
        description: 'Comparing against requirements',
        color: '#A855F7'
    },
    {
        id: 4,
        icon: BarChart3,
        label: 'Score',
        description: 'Generating proficiency heatmap',
        color: '#6366F1'
    },
    {
        id: 5,
        icon: GraduationCap,
        label: 'Recommend',
        description: 'Building learning roadmap',
        color: '#00D9FF'
    },
];

export default function AnimatedWorkflow({ isProcessing, currentStep }: AnimatedWorkflowProps) {
    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        if (isProcessing) {
            // Create flowing particles
            const interval = setInterval(() => {
                setParticles(prev => [...prev, Date.now()].slice(-8));
            }, 200);
            return () => clearInterval(interval);
        } else {
            setParticles([]);
        }
    }, [isProcessing]);

    return (
        <div className="relative py-12 px-4 overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-llama-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-llama-cyan-500/10 rounded-full blur-3xl" />
            </div>

            {/* Main workflow container */}
            <div className="relative max-w-5xl mx-auto">
                {/* Animated document flowing through */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{
                                x: `${(currentStep / (stages.length - 1)) * 100}%`,
                                opacity: 1
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute top-0 left-0 z-20"
                            style={{
                                left: `${(currentStep / (stages.length - 1)) * 85}%`,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            {/* Floating document with glow */}
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative"
                            >
                                <div className="w-16 h-20 bg-white rounded-lg shadow-2xl border-2 flex flex-col items-center justify-center"
                                    style={{ borderColor: stages[currentStep]?.color }}>
                                    <div className="w-8 h-1 bg-gray-300 rounded mb-1" />
                                    <div className="w-10 h-1 bg-gray-300 rounded mb-1" />
                                    <div className="w-6 h-1 bg-gray-300 rounded mb-1" />
                                    <div className="w-9 h-1 bg-gray-300 rounded mb-1" />
                                    <div className="w-7 h-1 bg-gray-300 rounded" />
                                </div>
                                {/* Sparkle effect */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="absolute -top-2 -right-2"
                                >
                                    <Sparkles className="w-6 h-6" style={{ color: stages[currentStep]?.color }} />
                                </motion.div>
                                {/* Glow ring */}
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 rounded-lg"
                                    style={{
                                        boxShadow: `0 0 40px ${stages[currentStep]?.color}`,
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Connection line with gradient */}
                <div className="absolute top-24 left-0 right-0 h-1 z-0">
                    <div className="h-full bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 rounded-full opacity-20" />
                    {/* Animated progress */}
                    {isProcessing && (
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / stages.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                            className="absolute top-0 h-full bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 rounded-full"
                        />
                    )}
                </div>

                {/* Flowing particles */}
                <AnimatePresence>
                    {particles.map((p, i) => (
                        <motion.div
                            key={p}
                            initial={{ x: 0, opacity: 0 }}
                            animate={{
                                x: '100%',
                                opacity: [0, 1, 1, 0],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "linear" }}
                            className="absolute top-24 left-0 w-3 h-3 rounded-full bg-gradient-to-r from-llama-orange-500 to-llama-cyan-500 z-10"
                            style={{ transform: 'translateY(-50%)' }}
                        />
                    ))}
                </AnimatePresence>

                {/* Stage nodes */}
                <div className="relative flex justify-between items-start pt-8">
                    {stages.map((stage, index) => {
                        const isActive = isProcessing && currentStep === index;
                        const isCompleted = isProcessing && currentStep > index;
                        const Icon = stage.icon;

                        return (
                            <motion.div
                                key={stage.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col items-center relative z-10"
                                style={{ width: `${100 / stages.length}%` }}
                            >
                                {/* Node circle */}
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.2 : 1,
                                        boxShadow: isActive
                                            ? `0 0 30px ${stage.color}, 0 0 60px ${stage.color}40`
                                            : isCompleted
                                                ? `0 0 15px ${stage.color}60`
                                                : 'none',
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className={`
                    w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive
                                            ? 'bg-white border-4'
                                            : isCompleted
                                                ? 'bg-white border-2'
                                                : 'bg-gray-100 border-2 border-gray-200'
                                        }
                  `}
                                    style={{
                                        borderColor: isActive || isCompleted ? stage.color : undefined,
                                    }}
                                >
                                    <Icon
                                        className={`w-6 h-6 transition-colors duration-300`}
                                        style={{
                                            color: isActive || isCompleted ? stage.color : '#9CA3AF'
                                        }}
                                    />

                                    {/* Pulsing ring for active */}
                                    {isActive && (
                                        <motion.div
                                            animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full border-2"
                                            style={{ borderColor: stage.color }}
                                        />
                                    )}

                                    {/* Checkmark for completed */}
                                    {isCompleted && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                                        >
                                            <span className="text-white text-xs">✓</span>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Label */}
                                <motion.span
                                    animate={{
                                        color: isActive ? stage.color : isCompleted ? '#374151' : '#9CA3AF',
                                        fontWeight: isActive ? 700 : 500,
                                    }}
                                    className="mt-3 text-sm transition-all duration-300"
                                >
                                    {stage.label}
                                </motion.span>

                                {/* Description - shows when active */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-xs text-gray-500 mt-1 text-center max-w-[100px]"
                                        >
                                            {stage.description}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Processing indicator */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-12 text-center"
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-full">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                                <span className="font-medium">
                                    {stages[currentStep]?.description || 'Processing...'}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
