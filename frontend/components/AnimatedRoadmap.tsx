import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight, Play, CheckCircle, Clock, ExternalLink, Sparkles } from 'lucide-react';

interface RoadmapItem {
    month: number;
    skill: string;
    course_title: string;
    course_url: string;
    thumbnail?: string;
    description: string;
    status?: string;
}

interface AnimatedRoadmapProps {
    roadmap: RoadmapItem[];
    roleDetected?: string;
}

const monthColors = [
    { bg: 'from-llama-orange-500 to-llama-coral-400', text: '#FF6B35', light: 'rgba(255, 107, 53, 0.1)' },
    { bg: 'from-llama-coral-400 to-pink-500', text: '#FF8E72', light: 'rgba(255, 142, 114, 0.1)' },
    { bg: 'from-pink-500 to-llama-magenta-500', text: '#E040FB', light: 'rgba(224, 64, 251, 0.1)' },
    { bg: 'from-llama-magenta-500 to-llama-purple-500', text: '#A855F7', light: 'rgba(168, 85, 247, 0.1)' },
    { bg: 'from-llama-purple-500 to-llama-indigo-500', text: '#6366F1', light: 'rgba(99, 102, 241, 0.1)' },
    { bg: 'from-llama-indigo-500 to-llama-cyan-500', text: '#00D9FF', light: 'rgba(0, 217, 255, 0.1)' },
];

export default function AnimatedRoadmap({ roadmap, roleDetected }: AnimatedRoadmapProps) {
    const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    // Group by month
    const groupedRoadmap = roadmap.reduce((acc, item) => {
        const month = item.month;
        if (!acc[month]) acc[month] = [];
        acc[month].push(item);
        return acc;
    }, {} as Record<number, RoadmapItem[]>);

    const months = Object.keys(groupedRoadmap).map(Number).sort((a, b) => a - b);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
        >
            {/* Header with light gradient background */}
            <div className="relative p-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 overflow-hidden">
                {/* Animated gradient particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                background: `linear-gradient(135deg, ${i % 3 === 0 ? '#FF6B35' : i % 3 === 1 ? '#E040FB' : '#00D9FF'
                                    }, ${i % 3 === 0 ? '#FF8E72' : i % 3 === 1 ? '#A855F7' : '#6366F1'
                                    })`,
                            }}
                            initial={{
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%',
                                opacity: 0.2
                            }}
                            animate={{
                                y: [null, '-30%'],
                                opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-llama-orange-500 to-llama-cyan-500 flex items-center justify-center shadow-lg"
                            >
                                <BookOpen className="w-6 h-6 text-white" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-black">Your 6-Month Journey</h3>
                        </div>
                        <p className="text-gray-500">
                            Personalized learning path to become a top {roleDetected || 'professional'}
                        </p>
                    </div>

                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                        className="hidden md:block"
                    >
                        <Sparkles className="w-8 h-8 text-llama-orange-500" />
                    </motion.div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 relative">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500"
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        {months.map((month, i) => (
                            <motion.span
                                key={month}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="text-xs font-medium text-gray-400"
                            >
                                M{month}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline content */}
            <div className="p-8">
                <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: '100%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="w-full bg-gradient-to-b from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500"
                        />
                    </div>

                    {/* Month sections */}
                    <div className="space-y-8">
                        {months.map((month, monthIndex) => {
                            const colorScheme = monthColors[(month - 1) % monthColors.length];
                            const items = groupedRoadmap[month];

                            return (
                                <motion.div
                                    key={month}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + monthIndex * 0.15 }}
                                    className="relative pl-16"
                                    onMouseEnter={() => setHoveredMonth(month)}
                                    onMouseLeave={() => setHoveredMonth(null)}
                                >
                                    {/* Month badge */}
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={`absolute left-0 w-12 h-12 rounded-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center shadow-lg z-10`}
                                        style={{
                                            boxShadow: hoveredMonth === month
                                                ? `0 0 30px ${colorScheme.text}60`
                                                : 'none'
                                        }}
                                    >
                                        <span className="text-white font-bold text-sm">M{month}</span>

                                        {/* Pulse effect */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.5, 0, 0.5]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorScheme.bg}`}
                                        />
                                    </motion.div>

                                    {/* Month header */}
                                    <div className="mb-4">
                                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            Month {month}
                                            <Clock className="w-4 h-4 text-gray-400" />
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {items.length} course{items.length > 1 ? 's' : ''} to complete
                                        </p>
                                    </div>

                                    {/* Course cards */}
                                    <div className="space-y-4">
                                        {items.map((item, itemIndex) => {
                                            const isExpanded = expandedCard === monthIndex * 10 + itemIndex;

                                            return (
                                                <motion.div
                                                    key={itemIndex}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 + monthIndex * 0.1 + itemIndex * 0.05 }}
                                                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                                    className="group relative rounded-xl border border-gray-100 overflow-hidden transition-all duration-300"
                                                    style={{ backgroundColor: colorScheme.light }}
                                                    onClick={() => setExpandedCard(isExpanded ? null : monthIndex * 10 + itemIndex)}
                                                >
                                                    {/* Gradient accent bar */}
                                                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colorScheme.bg}`} />

                                                    <div className="p-5 pl-6">
                                                        <div className="flex gap-4">
                                                            {/* Thumbnail */}
                                                            <div className="relative flex-shrink-0">
                                                                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-200">
                                                                    {item.thumbnail ? (
                                                                        <img
                                                                            src={item.thumbnail}
                                                                            alt=""
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center`}
                                                                        >
                                                                            <Play className="w-6 h-6 text-white" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {/* Play button overlay */}
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    whileHover={{ opacity: 1 }}
                                                                    className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center"
                                                                >
                                                                    <Play className="w-6 h-6 text-white fill-white" />
                                                                </motion.div>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                {/* Skill tag */}
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span
                                                                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                                                        style={{
                                                                            backgroundColor: `${colorScheme.text}20`,
                                                                            color: colorScheme.text
                                                                        }}
                                                                    >
                                                                        {item.skill}
                                                                    </span>
                                                                    {item.status === 'Bonus' && (
                                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600">
                                                                            Bonus
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Title */}
                                                                <h5 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1 mb-1">
                                                                    {item.course_title}
                                                                </h5>

                                                                {/* Description - expandable */}
                                                                <AnimatePresence>
                                                                    {isExpanded && (
                                                                        <motion.p
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="text-sm text-gray-500 mb-2"
                                                                        >
                                                                            {item.description}
                                                                        </motion.p>
                                                                    )}
                                                                </AnimatePresence>

                                                                {/* Action button */}
                                                                <a
                                                                    href={item.course_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                                                                    style={{ color: colorScheme.text }}
                                                                >
                                                                    Start Learning
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>

                                                            {/* Arrow indicator */}
                                                            <motion.div
                                                                animate={{ x: [0, 5, 0] }}
                                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow"
                                                            >
                                                                <ArrowRight
                                                                    className="w-5 h-5"
                                                                    style={{ color: colorScheme.text }}
                                                                />
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Completion celebration */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5 }}
                        className="relative pl-16 mt-8"
                    >
                        <div className="absolute left-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg z-10">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                            <h4 className="text-lg font-bold text-green-800 mb-1">
                                🎉 Journey Complete!
                            </h4>
                            <p className="text-sm text-green-600">
                                After 6 months, you'll have mastered all the skills needed for your dream role.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
