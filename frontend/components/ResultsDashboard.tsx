import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, TrendingUp, BookOpen, Target, ArrowRight } from 'lucide-react';

import { AnalysisResult } from '../services/api';

interface ResultsDashboardProps {
    result: AnalysisResult;
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
    // Helper to determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    const overallScore = Math.round(result.match_score || 0);

    return (
        <div className="space-y-8">
            {/* Top Row: Overall Score & High Level Assessment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-white to-slate-50"
                >
                    <h3 className="text-slate-500 font-medium mb-4 uppercase tracking-wider text-sm">Overall Match Score</h3>
                    <div className="relative mb-4">
                        <svg className="w-40 h-40 transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - overallScore / 100)}
                                className={overallScore >= 70 ? 'text-llama-indigo-600' : overallScore >= 50 ? 'text-amber-500' : 'text-rose-500'}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-5xl font-bold text-slate-900">{overallScore}%</span>
                        </div>
                    </div>
                </motion.div>

                {/* Assessment Summary / Role Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 glass-card p-8 flex flex-col justify-center"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-llama-indigo-600" />
                        AI Assessment
                    </h3>
                    <div className="mb-4">
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Detected Role</span>
                        <p className="text-2xl font-bold text-slate-800">{result.role_detected || "Software Engineer"}</p>
                    </div>
                    {/* Fallback to detailed analysis if available, or generic message */}
                    <p className="text-slate-600 leading-relaxed text-lg">
                        {result.detailed_analysis?.overall_assessment ||
                            `We've analyzed your profile against ${result.role_detected} standards. Your match score is ${overallScore}%.`}
                    </p>
                </motion.div>
            </div>

            {/* Skill Heatmap Redesign */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-8 bg-white"
            >
                <div className="flex items-center mb-6">
                    <Target className="w-6 h-6 text-llama-indigo-600 mr-3" />
                    <h3 className="text-xl font-bold text-slate-900">Skill Proficiency Heatmap</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.heatmap_data?.map((item, index) => {
                        const isMatch = item.status === 'match';
                        const isGap = item.status === 'gap';

                        return (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                className={`
                                    relative group p-4 rounded-xl border shadow-sm transition-all duration-300 cursor-default
                                    ${isMatch
                                        ? 'bg-gradient-to-r from-llama-indigo-500 to-llama-purple-500 border-transparent text-white shadow-indigo-200'
                                        : 'bg-slate-50 border-rose-100 text-slate-700 hover:border-rose-200'
                                    }
                                `}
                                onClick={() => {
                                    if (isGap) {
                                        document.getElementById('roadmap-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                    {isMatch ? "Strong proficiency detected in resume." : "Critical skill missing for target role."}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg leading-tight">{item.skill}</span>
                                    {isMatch ? (
                                        <CheckCircle className="w-5 h-5 text-white/90 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">
                                    <span>{isMatch ? 'Matched' : 'Skill Gap'}</span>
                                    <span>{item.score}%</span>
                                </div>

                                {/* Progress Bar */}
                                <div className={`w-full h-1.5 rounded-full ${isMatch ? 'bg-white/30' : 'bg-slate-200'}`}>
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isMatch ? 'bg-white' : 'bg-rose-500'}`}
                                        style={{ width: `${item.score}%` }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Personalized Learning Roadmap Redesign */}
            {result.roadmap && result.roadmap.length > 0 && (
                <motion.div
                    id="roadmap-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="mt-12"
                >
                    <div className="flex items-center mb-2">
                        <BookOpen className="w-6 h-6 text-llama-indigo-600 mr-3" />
                        <h3 className="text-xl font-bold text-slate-900">Your 6-Month Execution Plan</h3>
                    </div>
                    <p className="text-slate-600 mb-8 ml-9 text-sm">A step-by-step strategic path to execute your transition to {result.role_detected}.</p>

                    <div className="relative ml-4 md:ml-6 space-y-12">
                        {/* Continuous Vertical Line */}
                        <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-slate-200" />

                        {/* Group and Sort Roadmap by Month */}
                        {Object.entries(
                            result.roadmap
                                .sort((a, b) => a.month - b.month)
                                .reduce((groups, item) => {
                                    const month = item.month;
                                    if (!groups[month]) groups[month] = [];
                                    groups[month].push(item);
                                    return groups;
                                }, {} as Record<number, typeof result.roadmap>)
                        ).map(([month, items], groupIndex) => (
                            <div key={month} className="relative pl-12 md:pl-16">
                                {/* Month Node Badge */}
                                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-4 border-llama-indigo-500 flex items-center justify-center z-10 shadow-sm">
                                    <span className="font-bold text-llama-indigo-700 text-sm">M{month}</span>
                                </div>

                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 opacity-75">
                                    Month {month} Goals
                                </h4>

                                <div className="space-y-4">
                                    {items.map((node, index) => (
                                        <motion.a
                                            key={`${month}-${index}`}
                                            href={node.course_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.01, x: 4 }}
                                            className="group flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-llama-indigo-200 transition-all cursor-pointer"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-full md:w-24 h-50 md:h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                {node.thumbnail ? (
                                                    <img src={node.thumbnail} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-llama-indigo-500 to-llama-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                                        {node.skill[0]}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider border border-rose-100">
                                                        Gap: {node.skill}
                                                    </span>
                                                </div>
                                                <h5 className="font-bold text-slate-800 text-sm md:text-base leading-tight mb-1 group-hover:text-llama-indigo-600 transition-colors line-clamp-2">
                                                    {node.course_title}
                                                </h5>
                                                <p className="text-xs text-slate-500 line-clamp-1">{node.description}</p>
                                            </div>

                                            {/* Action Arrow */}
                                            <div className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 items-center justify-center group-hover:bg-llama-indigo-600 group-hover:text-white transition-colors">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
            {/* Matched Jobs */}
            {result.matched_jobs && result.matched_jobs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Recommended Jobs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {result.matched_jobs.map((job) => (
                            <a
                                key={job.id}
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-llama-indigo-200 transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 group-hover:text-llama-indigo-600 transition-colors line-clamp-2">{job.position}</h4>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{Math.round(job.match_score)}%</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">{job.company}</p>
                                <div className="flex items-center text-sm font-medium text-llama-indigo-600 group-hover:translate-x-1 transition-transform">
                                    Apply Now <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
