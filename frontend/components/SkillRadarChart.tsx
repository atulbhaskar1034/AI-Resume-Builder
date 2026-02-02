'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
} from 'recharts';
import { Target, TrendingUp, Sparkles, Zap, ChevronRight } from 'lucide-react';

interface SkillRadarItem {
    skill: string;
    userScore: number;
    marketScore: number;
}

interface SkillRadarChartProps {
    data: SkillRadarItem[];
}

// Custom tooltip with glassmorphism
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const gap = data.marketScore - data.userScore;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative"
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl" />

                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50">
                    {/* Skill Name with gradient */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
                        <h4 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            {data.skill}
                        </h4>
                    </div>

                    {/* Score comparison */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/50" />
                                <span className="text-sm text-gray-600">Your Level</span>
                            </div>
                            <span className="text-lg font-bold text-violet-600">{data.userScore}/10</span>
                        </div>

                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-400" />
                                <span className="text-sm text-gray-600">Market Demand</span>
                            </div>
                            <span className="text-lg font-bold text-gray-600">{data.marketScore}/10</span>
                        </div>
                    </div>

                    {/* Gap indicator */}
                    {gap > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${gap <= 2 ? 'bg-green-50 text-green-700' :
                                    gap <= 5 ? 'bg-orange-50 text-orange-700' :
                                        'bg-red-50 text-red-700'
                                }`}>
                                <Zap className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                    {gap <= 2 ? 'Almost there!' : gap <= 5 ? `${gap} points to improve` : `${gap} points gap!`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }
    return null;
};

// Animated skill card component
const SkillCard = ({ item, index }: { item: SkillRadarItem; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    const gap = item.marketScore - item.userScore;
    const percentage = (item.userScore / item.marketScore) * 100;

    const getGradient = () => {
        if (gap <= 2) return 'from-emerald-400 via-green-500 to-teal-500';
        if (gap <= 5) return 'from-amber-400 via-orange-500 to-red-400';
        return 'from-red-400 via-rose-500 to-pink-500';
    };

    const getGlowColor = () => {
        if (gap <= 2) return 'shadow-emerald-500/30';
        if (gap <= 5) return 'shadow-orange-500/30';
        return 'shadow-red-500/30';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: 0.1 * index,
                type: "spring",
                stiffness: 100,
                damping: 15
            }}
            whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${isHovered ? `shadow-xl ${getGlowColor()}` : 'shadow-md'
                }`}
        >
            {/* Background gradient on hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-5`}
                    />
                )}
            </AnimatePresence>

            {/* Card content */}
            <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100/80 p-4 h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800 truncate pr-2">
                            {item.skill}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {item.userScore}/10 proficiency
                        </p>
                    </div>

                    {/* Gap badge */}
                    <motion.div
                        animate={isHovered ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1 }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${gap <= 2 ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border border-emerald-100' :
                                gap <= 5 ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 border border-orange-100' :
                                    'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border border-red-100'
                            }`}
                    >
                        {gap > 0 ? (
                            <>
                                <span>-{gap}</span>
                                {gap <= 2 && <Sparkles className="w-3 h-3" />}
                            </>
                        ) : (
                            <span className="flex items-center gap-0.5">✓ <Sparkles className="w-3 h-3" /></span>
                        )}
                    </motion.div>
                </div>

                {/* Progress bar container */}
                <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-30">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute top-0 bottom-0 w-px bg-gray-300"
                                style={{ left: `${(i + 1) * 10}%` }}
                            />
                        ))}
                    </div>

                    {/* Animated progress */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                            duration: 1.2,
                            delay: 0.3 + (0.1 * index),
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        className={`relative h-full rounded-full bg-gradient-to-r ${getGradient()}`}
                    >
                        {/* Shimmer effect */}
                        <motion.div
                            animate={{
                                x: ['-100%', '200%'],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                        />
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-medium text-gray-400">Current: {item.userScore}</span>
                    <motion.div
                        className="flex items-center gap-1"
                        animate={isHovered ? { x: 3 } : { x: 0 }}
                    >
                        <span className="text-[10px] font-medium text-gray-400">Target: {item.marketScore}</span>
                        <ChevronRight className={`w-3 h-3 transition-colors ${isHovered ? 'text-violet-500' : 'text-gray-300'}`} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default function SkillRadarChart({ data }: SkillRadarChartProps) {
    if (!data || data.length === 0) {
        return null;
    }

    const avgUserScore = data.reduce((sum, item) => sum + item.userScore, 0) / data.length;
    const avgGap = 10 - avgUserScore;
    const proficiencyLevel = avgUserScore >= 7 ? 'Advanced' : avgUserScore >= 5 ? 'Intermediate' : 'Beginner';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
        >
            {/* Animated background glow */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute -inset-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"
            />

            {/* Main container */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-100/80 overflow-hidden shadow-xl">
                {/* Decorative top gradient line */}
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-100/80">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Title section */}
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="relative"
                            >
                                {/* Icon glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl blur-lg opacity-50" />
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                    <Target className="w-7 h-7 text-white" />
                                </div>
                            </motion.div>

                            <div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                                    Skill Gap Analysis
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-500" />
                                    Your skills vs. Market demands
                                </p>
                            </div>
                        </div>

                        {/* Stats badges */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Proficiency badge */}
                            <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                                    <TrendingUp className="w-4 h-4 text-violet-600" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-violet-500 font-medium">Avg. Proficiency</span>
                                        <span className="text-sm font-bold text-violet-700">{avgUserScore.toFixed(1)}/10 · {proficiencyLevel}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Gap badge */}
                            <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                                    <Zap className="w-4 h-4 text-orange-600" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-orange-500 font-medium">Avg. Gap</span>
                                        <span className="text-sm font-bold text-orange-700">{avgGap.toFixed(1)} points</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Chart section */}
                <div className="p-6 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="relative h-[420px] w-full"
                    >
                        {/* Subtle background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-purple-50/50 rounded-2xl" />

                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                                <defs>
                                    <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
                                    </linearGradient>
                                    <linearGradient id="marketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.1} />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <PolarGrid
                                    stroke="#e5e7eb"
                                    strokeDasharray="4 4"
                                    strokeOpacity={0.6}
                                />

                                <PolarAngleAxis
                                    dataKey="skill"
                                    tick={{
                                        fill: '#374151',
                                        fontSize: 12,
                                        fontWeight: 600
                                    }}
                                    tickLine={false}
                                />

                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 10]}
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    tickCount={6}
                                    axisLine={false}
                                />

                                {/* Market demand layer (background) */}
                                <Radar
                                    name="Market Demand"
                                    dataKey="marketScore"
                                    stroke="#cbd5e1"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="url(#marketGradient)"
                                    fillOpacity={1}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />

                                {/* User skills layer (foreground) */}
                                <Radar
                                    name="Your Skills"
                                    dataKey="userScore"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="url(#userGradient)"
                                    fillOpacity={0.5}
                                    filter="url(#glow)"
                                    animationDuration={1800}
                                    animationBegin={400}
                                    animationEasing="ease-out"
                                    dot={{
                                        r: 6,
                                        fill: '#8b5cf6',
                                        stroke: '#fff',
                                        strokeWidth: 3,
                                        filter: 'url(#glow)'
                                    }}
                                />

                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'transparent' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Legend */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center gap-8 mt-4"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-3 rounded-sm bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30" />
                            <span className="text-sm font-medium text-gray-600">Your Skills</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-3 rounded-sm bg-gradient-to-r from-gray-300 to-gray-400 border border-dashed border-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Market Demand</span>
                        </div>
                    </motion.div>

                    {/* Skill breakdown cards */}
                    <div className="mt-8">
                        <motion.h4
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5 text-violet-500" />
                            Skill Breakdown
                        </motion.h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.map((item, index) => (
                                <SkillCard key={item.skill} item={item} index={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
