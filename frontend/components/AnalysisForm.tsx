import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Sparkles, ArrowRight } from 'lucide-react';
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
        <div className="space-y-8">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Resume Upload */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-black flex items-center">
                            <span className="w-7 h-7 rounded-full bg-black text-white text-sm flex items-center justify-center mr-3">1</span>
                            Upload Resume
                        </h2>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Required</span>
                    </div>

                    <div
                        className={`
                            relative min-h-[320px] border-2 border-dashed rounded-xl transition-all duration-300 
                            flex flex-col items-center justify-center p-8 text-center cursor-pointer
                            ${isDragging
                                ? 'border-llama-orange-500 bg-orange-50'
                                : resume
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
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
                                    <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-black mb-1">{resume.name}</h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        {(resume.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveResume();
                                        }}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 
                                                   hover:text-red-600 hover:border-red-200 hover:bg-red-50 
                                                   transition-all flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Remove</span>
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
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-black mb-2">
                                        Drop your resume here
                                    </h3>
                                    <p className="text-gray-500 text-sm max-w-xs mb-6">
                                        Supports PDF, DOCX, and TXT files
                                    </p>
                                    <span className="px-5 py-2.5 bg-black text-white text-sm font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors">
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
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-black flex items-center">
                            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-sm flex items-center justify-center mr-3">2</span>
                            Job Description
                        </h2>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Optional</span>
                    </div>

                    <div className="relative min-h-[320px] bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="w-full h-full min-h-[320px] p-6 bg-transparent border-0 resize-none 
                                       focus:ring-0 focus:outline-none text-gray-700 placeholder:text-gray-400 
                                       leading-relaxed"
                            placeholder="Paste a job description to compare against, or leave blank to analyze against general market trends and role standards."
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                {jobDescription.length} characters
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center pt-8"
            >
                <button
                    onClick={onAnalyze}
                    disabled={isLoading || !resume}
                    className={`
                        px-10 py-4 bg-black text-white text-sm font-semibold uppercase tracking-wide
                        inline-flex items-center gap-3 transition-all
                        ${(isLoading || !resume)
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-gray-800 hover:scale-105'
                        }
                    `}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>Analyze Resume</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>

                {!resume && (
                    <p className="mt-4 text-sm text-gray-400">
                        Upload a resume to enable analysis
                    </p>
                )}
            </motion.div>
        </div>
    );
}
