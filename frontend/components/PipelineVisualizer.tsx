import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSearch, Database, Cpu, Rocket, Sparkles } from 'lucide-react';

interface PipelineVisualizerProps {
    currentStep: 'analyze' | 'fetch' | 'synthesize' | '';
    latestLog: string;
    isComplete?: boolean;
}

const STEP_MAPPING: Record<string, number> = {
    '': 0,
    'analyze': 1,
    'fetch': 2,
    'synthesize': 3,
};

const STEPS = [
    { id: 0, label: 'Upload', icon: Upload, color: '#f97316', gradient: 'from-orange-400 to-orange-600' },
    { id: 1, label: 'Parse', icon: FileSearch, color: '#8b5cf6', gradient: 'from-violet-400 to-violet-600' },
    { id: 2, label: 'Analyze', icon: Database, color: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600' },
    { id: 3, label: 'Build', icon: Cpu, color: '#f59e0b', gradient: 'from-amber-400 to-amber-600' },
    { id: 4, label: 'Ready', icon: Rocket, color: '#22c55e', gradient: 'from-emerald-400 to-emerald-600' },
];

// Simple, Working Robot Component
function SimpleRobot({ isAnimating }: { isAnimating: boolean }) {
    return (
        <motion.div
            className="relative"
            animate={isAnimating ? { y: [0, -6, 0] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Robot */}
            <div className="relative">
                {/* Glow behind robot */}
                <div className="absolute inset-0 bg-orange-400/30 rounded-2xl blur-xl scale-150" />

                {/* Robot body */}
                <div className="relative w-16 h-14 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-300 shadow-lg">
                    {/* Antenna */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <motion.div
                            animate={isAnimating ? { rotate: [-5, 5, -5] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="origin-bottom"
                        >
                            <div className="w-1 h-3 bg-gray-400 rounded-full mx-auto" />
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2.5 h-2.5 bg-orange-500 rounded-full -mt-0.5 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                            />
                        </motion.div>
                    </div>

                    {/* Screen/Face */}
                    <div className="absolute inset-1.5 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl flex items-center justify-center gap-2">
                        {/* Eyes */}
                        <motion.div
                            animate={isAnimating ? { scaleY: [1, 0.1, 1] } : {}}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        />
                        <motion.div
                            animate={isAnimating ? { scaleY: [1, 0.1, 1] } : {}}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        />
                    </div>

                    {/* Ears */}
                    <div className="absolute top-3 -left-1.5 w-2 h-4 bg-gradient-to-b from-orange-400 to-orange-500 rounded-l-lg" />
                    <div className="absolute top-3 -right-1.5 w-2 h-4 bg-gradient-to-b from-orange-400 to-orange-500 rounded-r-lg" />
                </div>
            </div>
        </motion.div>
    );
}

export default function PipelineVisualizer({ currentStep, latestLog, isComplete = false }: PipelineVisualizerProps) {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([0]));

    useEffect(() => {
        const mappedIndex = STEP_MAPPING[currentStep] ?? 0;
        if (mappedIndex > 0) {
            setActiveStepIndex(mappedIndex);
            const newCompleted = new Set<number>();
            for (let i = 0; i < mappedIndex; i++) {
                newCompleted.add(i);
            }
            setCompletedSteps(newCompleted);
        }
    }, [currentStep]);

    useEffect(() => {
        if (isComplete) {
            setActiveStepIndex(4);
            setCompletedSteps(new Set([0, 1, 2, 3, 4]));
        }
    }, [isComplete]);

    const getProgressWidth = () => `${(activeStepIndex / (STEPS.length - 1)) * 100}%`;

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-2">
            {/* Robot Header */}
            <div className="flex flex-col items-center mb-6">
                <SimpleRobot isAnimating={!isComplete} />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3"
                >
                    <motion.span
                        animate={!isComplete ? { opacity: [0.5, 1, 0.5] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`text-sm font-medium ${isComplete ? 'text-emerald-600' : 'text-gray-500'}`}
                    >
                        {isComplete ? "✨ All done!" : "Working on it..."}
                    </motion.span>
                </motion.div>
            </div>

            {/* Pipeline Track */}
            <div className="relative py-6 px-4">
                {/* Background Track */}
                <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1.5 bg-gray-100 rounded-full" />

                {/* Progress Fill */}
                <motion.div
                    className="absolute left-10 top-1/2 -translate-y-1/2 h-1.5 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `calc(${getProgressWidth()} - 20px)` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    style={{ maxWidth: 'calc(100% - 80px)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-violet-500 to-cyan-500" />
                </motion.div>

                {/* Step Nodes */}
                <div className="relative flex justify-between items-center">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === activeStepIndex;
                        const isCompleted = completedSteps.has(index) || (isComplete && index <= 4);
                        const isPending = !isActive && !isCompleted;

                        return (
                            <div key={step.id} className="relative flex flex-col items-center z-10">
                                {/* Ripple for active */}
                                {isActive && !isComplete && (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0.5 }}
                                            animate={{ scale: 2, opacity: 0 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute w-10 h-10 rounded-xl"
                                            style={{ backgroundColor: step.color }}
                                        />
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0.3 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                            className="absolute w-10 h-10 rounded-xl"
                                            style={{ backgroundColor: step.color }}
                                        />
                                    </>
                                )}

                                {/* Node */}
                                <motion.div
                                    animate={{ scale: isActive ? 1.15 : 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="relative"
                                >
                                    <div
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive || isCompleted
                                                ? `bg-gradient-to-br ${step.gradient}`
                                                : 'bg-white border-2 border-gray-200'
                                            }`}
                                        style={{
                                            boxShadow: isActive
                                                ? `0 8px 20px -5px ${step.color}50`
                                                : isCompleted
                                                    ? `0 4px 12px -3px ${step.color}30`
                                                    : '0 2px 6px rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`} />
                                    </div>

                                    {/* Checkmark */}
                                    {isCompleted && !isActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                                        >
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span
                                    className={`mt-2 text-xs font-semibold ${isActive ? '' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                                        }`}
                                    style={{ color: isActive ? step.color : undefined }}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status Log */}
            <div className="mt-4 flex justify-center">
                <motion.div
                    key={latestLog}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-gray-100"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <Sparkles className="w-4 h-4 text-orange-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-600 max-w-[280px] truncate">
                        {latestLog || 'Initializing...'}
                    </span>
                </motion.div>
            </div>

            {/* Step Counter */}
            <div className="mt-3 text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Step {activeStepIndex + 1} of {STEPS.length}
                </span>
            </div>
        </div>
    );
}
