import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PipelineVisualizer from './PipelineVisualizer';

interface AnalysisOverlayProps {
    resume: File;
    jobDescription?: string;
    onComplete: (result: any) => void;
    onError: (error: string) => void;
}

type StepType = 'analyze' | 'fetch' | 'synthesize' | '';

export default function AnalysisOverlay({ resume, jobDescription, onComplete, onError }: AnalysisOverlayProps) {
    const [currentStep, setCurrentStep] = useState<StepType>('');
    const [lastStep, setLastStep] = useState<StepType>('');
    const [latestLog, setLatestLog] = useState('Initializing analysis...');
    const [isComplete, setIsComplete] = useState(false);

    const updateStep = (newStep: StepType) => {
        if (newStep && newStep !== lastStep) {
            setLastStep(newStep);
            setCurrentStep(newStep);
        }
    };

    useEffect(() => {
        const runAnalysis = async () => {
            try {
                const formData = new FormData();
                formData.append('resume', resume);
                if (jobDescription) {
                    formData.append('job_description', jobDescription);
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                setLatestLog(`Connecting to analysis server...`);

                const response = await fetch(`${apiUrl}/analyze-stream`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    throw new Error('No response body');
                }

                let finalResult: any = null;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    const lines = text.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));

                                if (data.type === 'log') {
                                    if (data.step) updateStep(data.step as StepType);
                                    if (data.content) setLatestLog(data.content);
                                } else if (data.type === 'node') {
                                    updateStep(data.node as StepType);
                                    if (data.message) setLatestLog(data.message);
                                } else if (data.type === 'result') {
                                    console.log('SSE RESULT EVENT - data:', data);
                                    console.log('SSE RESULT EVENT - payload:', data.payload);
                                    console.log('SSE RESULT EVENT - role_detected:', data.payload?.role_detected);
                                    finalResult = data.payload;
                                    setLatestLog('Analysis complete!');
                                } else if (data.type === 'done') {
                                    setIsComplete(true);
                                    setLatestLog('Preparing your results...');
                                    setTimeout(() => {
                                        if (finalResult) onComplete(finalResult);
                                    }, 1500);
                                } else if (data.type === 'error') {
                                    onError(data.content);
                                }
                            } catch (e) { }
                        }
                    }
                }
            } catch (err: any) {
                setLatestLog(`Error: ${err.message}`);
                onError(err.message);
            }
        };

        runAnalysis();
    }, [resume, jobDescription]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
            {/* Beautiful Animated Background */}
            <div className="absolute inset-0">
                {/* Base gradient - clean and professional */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-violet-50" />

                {/* Animated gradient orbs - orange theme matching website */}
                <motion.div
                    animate={{
                        x: [0, 80, 30, 0],
                        y: [0, -40, 60, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0) 70%)',
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, -60, 40, 0],
                        y: [0, 50, -30, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0) 70%)',
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, 30, -40, 0],
                        y: [0, -50, 20, 0],
                        scale: [1, 1.05, 0.95, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0) 70%)',
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, -25, 50, 0],
                        y: [0, 40, -20, 0],
                        scale: [1, 0.95, 1.08, 1],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0) 70%)',
                    }}
                />

                {/* Subtle dot pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
            </div>

            {/* Main Glass Card */}
            <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 80, damping: 18 }}
                className="relative z-10 w-[650px] min-h-[400px] bg-white/90 backdrop-blur-2xl rounded-3xl flex flex-col items-center justify-center p-10 border border-white/60"
                style={{
                    boxShadow: `
                        0 0 0 1px rgba(255,255,255,0.5),
                        0 1px 2px rgba(0,0,0,0.02),
                        0 4px 8px rgba(0,0,0,0.04),
                        0 16px 32px rgba(0,0,0,0.06),
                        0 32px 64px rgba(0,0,0,0.08)
                    `,
                }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-violet-500 to-cyan-500 rounded-t-3xl" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-2"
                >
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                        Analyzing Your Resume
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">
                        Our AI is crafting your personalized career roadmap
                    </p>
                </motion.div>

                {/* Pipeline Visualizer */}
                <PipelineVisualizer
                    currentStep={currentStep}
                    latestLog={latestLog}
                    isComplete={isComplete}
                />

                {/* Bottom decorative line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full"
                />
            </motion.div>
        </motion.div>
    );
}
