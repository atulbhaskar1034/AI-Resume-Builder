import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisFormProps {
    onAnalyze: () => void;
    isLoading: boolean;
    jobDescription: string;
    setJobDescription: (value: string) => void;
    onFileSelect: (file: File) => void;
    resume: File | null;
    onRemoveResume: () => void;
}

export default function AnalysisForm({
    onAnalyze,
    isLoading,
    jobDescription,
    setJobDescription,
    onFileSelect,
    resume,
    onRemoveResume
}: AnalysisFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column: Resume Upload */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col h-full"
            >
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-llama-indigo-600 flex items-center justify-center mr-3">
                        1
                    </div>
                    Upload Resume
                </h2>

                <div
                    className={`
            relative flex-1 min-h-[300px] border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer group
            ${isDragging
                            ? 'border-llama-indigo-500 bg-indigo-50'
                            : resume
                                ? 'border-emerald-400 bg-emerald-50/30'
                                : 'border-slate-200 hover:border-llama-indigo-400 hover:bg-slate-50'
                        }
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !resume && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                    />

                    <AnimatePresence mode="wait">
                        {resume ? (
                            <motion.div
                                key="file-selected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">{resume.name}</h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    {(resume.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveResume();
                                    }}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200 flex items-center space-x-2 shadow-sm"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Remove File</span>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload-prompt"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="w-8 h-8 text-llama-indigo-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Drop your resume here</h3>
                                <p className="text-slate-500 max-w-xs mb-6">
                                    Support for PDF, DOCX, and TXT files. We analyze content layout and semantics.
                                </p>
                                <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm group-hover:border-llama-indigo-300 transition-colors">
                                    Browse Files
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Right Column: Job Description */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col h-full"
            >
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-llama-purple-600 flex items-center justify-center mr-3">
                        2
                    </div>
                    Job Description <span className="text-sm font-normal text-slate-400 ml-2">(Optional)</span>
                </h2>

                <div className="relative flex-1 min-h-[300px] bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-llama-indigo-500/20 transition-shadow">
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full h-full p-6 bg-transparent border-0 resize-none focus:ring-0 text-slate-700 placeholder:text-slate-400 leading-relaxed"
                        placeholder="Leave blank to analyze against general market trends."
                    />
                    <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                        {jobDescription.length} chars
                    </div>
                </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="col-span-1 lg:col-span-2 flex justify-center mt-8"
            >
                <button
                    onClick={onAnalyze}
                    disabled={isLoading || !resume}
                    className={`
            btn-primary text-lg px-12 py-4 rounded-xl shadow-lg shadow-llama-indigo-500/25 min-w-[280px]
            ${(isLoading || !resume) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105'}
          `}
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Analyzing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Zap className="w-5 h-5 fill-current" />
                            <span>Analyze Match</span>
                        </div>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
