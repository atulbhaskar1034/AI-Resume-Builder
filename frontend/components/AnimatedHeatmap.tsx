import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, TrendingUp, Flame, Sparkles } from 'lucide-react';

interface HeatmapItem {
    skill: string;
    score: number;
    status: 'match' | 'gap';
}

interface AnimatedHeatmapProps {
    data: HeatmapItem[];
    onSkillClick?: (skill: string) => void;
}

export default function AnimatedHeatmap({ data, onSkillClick }: AnimatedHeatmapProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'matched' | 'gaps'>('all');

    // Sort by score descending
    const sortedData = [...data].sort((a, b) => b.score - a.score);

    const filteredData = sortedData.filter(item => {
        if (filter === 'matched') return item.status === 'match';
        if (filter === 'gaps') return item.status === 'gap';
        return true;
    });

    const matchedCount = data.filter(d => d.status === 'match').length;
    const gapCount = data.filter(d => d.status === 'gap').length;

    // Get color based on score
    const getColor = (score: number) => {
        if (score >= 90) return { main: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' };
        if (score >= 75) return { main: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', text: '#16A34A' };
        if (score >= 50) return { main: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706' };
        if (score >= 25) return { main: '#F97316', bg: 'rgba(249, 115, 22, 0.1)', text: '#EA580C' };
        return { main: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626' };
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Header with stats */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-llama-orange-500 to-llama-magenta-500 flex items-center justify-center"
                        >
                            <Flame className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold text-black">Skill Proficiency Heatmap</h3>
                            <p className="text-sm text-gray-500">{data.length} skills analyzed</p>
                        </div>
                    </div>

                    {/* Stats badges */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100"
                        >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">{matchedCount} Matched</span>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100"
                        >
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-semibold text-red-600">{gapCount} Gaps</span>
                        </motion.div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 mt-4">
                    {(['all', 'matched', 'gaps'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'all' ? 'All Skills' : f === 'matched' ? 'Matched' : 'Skill Gaps'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Heatmap grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredData.map((item, index) => {
                            const colors = getColor(item.score);
                            const isMatch = item.status === 'match';
                            const isHovered = hoveredIndex === index;

                            return (
                                <motion.div
                                    key={item.skill}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.03 }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={() => !isMatch && onSkillClick?.(item.skill)}
                                    className={`relative group ${!isMatch ? 'cursor-pointer' : ''}`}
                                >
                                    <motion.div
                                        animate={{
                                            y: isHovered ? -4 : 0,
                                            boxShadow: isHovered
                                                ? `0 10px 30px ${colors.main}30`
                                                : '0 2px 8px rgba(0,0,0,0.05)',
                                        }}
                                        className="relative p-5 rounded-xl border-2 transition-all overflow-hidden"
                                        style={{
                                            backgroundColor: colors.bg,
                                            borderColor: isHovered ? colors.main : 'transparent',
                                        }}
                                    >
                                        {/* Corner glow */}
                                        <motion.div
                                            animate={{ scale: isHovered ? 1.5 : 1, opacity: isHovered ? 0.3 : 0.1 }}
                                            className="absolute -top-10 -right-10 w-24 h-24 rounded-full"
                                            style={{ backgroundColor: colors.main }}
                                        />

                                        {/* Top row */}
                                        <div className="relative flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-gray-900 capitalize text-lg">{item.skill}</h4>
                                                <span
                                                    className={`text-xs font-semibold uppercase tracking-wider ${!isMatch && onSkillClick ? 'hover:underline' : ''}`}
                                                    style={{ color: colors.text }}
                                                >
                                                    {isMatch ? '✓ Matched' : '+ Click to improve'}
                                                </span>
                                            </div>

                                            <motion.div
                                                animate={{
                                                    rotate: isHovered ? [0, -10, 10, 0] : 0,
                                                    scale: isHovered ? 1.1 : 1,
                                                }}
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `${colors.main}20` }}
                                            >
                                                {isMatch ? (
                                                    <CheckCircle className="w-5 h-5" style={{ color: colors.main }} />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5" style={{ color: colors.main }} />
                                                )}
                                            </motion.div>
                                        </div>

                                        {/* Score display */}
                                        <div className="relative flex items-end justify-between mb-3">
                                            <div className="flex items-baseline gap-1">
                                                <motion.span
                                                    key={item.score}
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="text-3xl font-black"
                                                    style={{ color: colors.main }}
                                                >
                                                    {item.score}
                                                </motion.span>
                                                <span className="text-sm font-medium text-gray-400">%</span>
                                            </div>

                                            {item.score >= 90 && (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Progress bar */}
                                        <div className="relative h-2 rounded-full bg-white overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: index * 0.05, ease: "easeOut" }}
                                                className="h-full rounded-full"
                                                style={{
                                                    background: `linear-gradient(90deg, ${colors.main}, ${colors.main}CC)`
                                                }}
                                            />

                                            {/* Shimmer effect on hover */}
                                            {isHovered && (
                                                <motion.div
                                                    animate={{ x: ['-100%', '200%'] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                                />
                                            )}
                                        </div>

                                        {/* Proficiency level label */}
                                        <div className="mt-3 flex justify-between text-xs text-gray-400">
                                            <span>Beginner</span>
                                            <span>Expert</span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Empty state */}
                {filteredData.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No skills match the current filter</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-2 rounded-full bg-red-500" />
                        <span className="text-gray-500">0-25%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-2 rounded-full bg-orange-500" />
                        <span className="text-gray-500">26-50%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-2 rounded-full bg-yellow-500" />
                        <span className="text-gray-500">51-75%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-500">76-100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
