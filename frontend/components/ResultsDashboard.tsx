import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, TrendingUp, Target, Briefcase, ArrowRight } from 'lucide-react';
import AnimatedRoadmap from './AnimatedRoadmap';
import AnimatedHeatmap from './AnimatedHeatmap';

import { AnalysisResult } from '../services/api';

interface ResultsDashboardProps {
    result: AnalysisResult;
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
    // Get continuous red-to-green color based on score (0-100)
    const getHeatmapColor = (score: number) => {
        const s = Math.max(0, Math.min(100, score));
        let r, g, b;

        if (s <= 50) {
            r = 239;
            g = Math.round((s / 50) * 200);
            b = 68;
        } else {
            r = Math.round(239 - ((s - 50) / 50) * 205);
            g = 197;
            b = Math.round(68 + ((s - 50) / 50) * 26);
        }

        return `rgb(${r}, ${g}, ${b})`;
    };

    // Get background color with opacity for heatmap cells
    const getHeatmapBgColor = (score: number, isMatch: boolean) => {
        if (isMatch) {
            const intensity = Math.round((score - 75) / 25 * 100);
            return `rgba(34, 197, 94, ${0.15 + (intensity / 100) * 0.2})`;
        } else {
            const s = Math.max(0, Math.min(50, score));
            if (s <= 25) {
                return `rgba(239, 68, 68, ${0.15})`;
            } else {
                return `rgba(245, 158, 11, ${0.12})`;
            }
        }
    };

    const overallScore = Math.round(result.match_score || 0);

    return (
        <div className="space-y-8">
            {/* Results Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
            >
                {/* Gradient top bar */}
                <div className="h-2 bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500" />

                <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                        {/* Score Section */}
                        <div className="flex flex-col items-center lg:items-start">
                            <div className="relative">
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle cx="80" cy="80" r="68" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                                    <motion.circle
                                        cx="80"
                                        cy="80"
                                        r="68"
                                        stroke="url(#scoreGradient)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={2 * Math.PI * 68}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - overallScore / 100) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#FF6B35" />
                                            <stop offset="50%" stopColor="#E040FB" />
                                            <stop offset="100%" stopColor="#00D9FF" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                        className="text-5xl font-black text-black"
                                    >
                                        {overallScore}%
                                    </motion.span>
                                    <span className="text-sm text-gray-400 font-medium">Match Score</span>
                                </div>
                            </div>

                            {/* Score label */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-4 px-4 py-2 rounded-full text-sm font-semibold"
                                style={{
                                    backgroundColor: overallScore >= 80 ? 'rgba(16, 185, 129, 0.1)' : overallScore >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: overallScore >= 80 ? '#059669' : overallScore >= 60 ? '#D97706' : '#DC2626'
                                }}
                            >
                                {overallScore >= 80 ? '🎯 Excellent Match!' : overallScore >= 60 ? '✅ Good Fit' : '⚡ Room for Growth'}
                            </motion.div>
                        </div>

                        {/* Divider */}
                        <div className="hidden lg:block w-px h-40 bg-gray-200" />

                        {/* Assessment Section */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-llama-orange-500 to-llama-magenta-500 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detected Role</p>
                                    <h3 className="text-xl font-bold text-black">{result.role_detected || "Software Engineer"}</h3>
                                </div>
                            </div>

                            <p className="text-gray-600 leading-relaxed mb-6">
                                {result.detailed_analysis?.overall_assessment ||
                                    `We've analyzed your profile against ${result.role_detected || 'industry'} standards. Your match score is ${overallScore}%. Scroll down to see skill gaps and recommended learning paths.`}
                            </p>

                            {/* Quick stats */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                        {result.heatmap_data?.filter(h => h.status === 'match').length || 0} Skills Matched
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-100">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-medium text-orange-600">
                                        {result.heatmap_data?.filter(h => h.status === 'gap').length || 0} Gaps to Fill
                                    </span>
                                </div>
                                {result.roadmap && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm font-medium text-purple-600">
                                            {result.roadmap.length} Courses Recommended
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Skill Heatmap - Using AnimatedHeatmap component */}
            {result.heatmap_data && result.heatmap_data.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <AnimatedHeatmap data={result.heatmap_data} />
                </motion.div>
            )}

            {/* Learning Roadmap - Now using AnimatedRoadmap component */}
            {result.roadmap && result.roadmap.length > 0 && (
                <motion.div
                    id="roadmap-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <AnimatedRoadmap
                        roadmap={result.roadmap}
                        roleDetected={result.role_detected}
                    />
                </motion.div>
            )}

            {/* Matched Jobs */}
            {result.matched_jobs && result.matched_jobs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Briefcase className="w-5 h-5 text-llama-orange-500" />
                        <h3 className="text-lg font-bold text-black">Recommended Jobs</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.matched_jobs.map((job) => (
                            <a
                                key={job.id}
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-black group-hover:text-llama-orange-500 transition-colors line-clamp-2">
                                        {job.position}
                                    </h4>
                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded flex-shrink-0 ml-2">
                                        {Math.round(job.match_score)}%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">{job.company}</p>
                                <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-llama-orange-500 transition-colors">
                                    View Job <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
