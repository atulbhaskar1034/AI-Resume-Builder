import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Toaster, toast } from 'react-hot-toast';
import Layout from '@/components/Layout';
import AnalysisForm from '@/components/AnalysisForm';
import ResultsDashboard from '@/components/ResultsDashboard';
import { useAnalysis } from '@/hooks/useAnalysis';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Search, Brain, Target, BarChart3, GraduationCap, CheckCircle } from 'lucide-react';

const stages = [
  { icon: FileText, label: 'Parsing Document', description: 'Extracting text from your resume...', color: '#FF6B35' },
  { icon: Search, label: 'Extracting Skills', description: 'Identifying skills and experience...', color: '#FF8E72' },
  { icon: Brain, label: 'Semantic Analysis', description: 'Understanding context with AI...', color: '#E040FB' },
  { icon: Target, label: 'Gap Detection', description: 'Comparing against requirements...', color: '#A855F7' },
  { icon: BarChart3, label: 'Scoring', description: 'Generating proficiency heatmap...', color: '#6366F1' },
  { icon: GraduationCap, label: 'Building Roadmap', description: 'Creating personalized learning path...', color: '#00D9FF' },
];

export default function Analyze() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [activeStep, setActiveStep] = useState(-1);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const {
    isLoading,
    results,
    error,
    analyzeSingleResume,
    reset
  } = useAnalysis();

  const handleAnalyze = async () => {
    if (!resume) return;

    setShowOverlay(true);
    setIsComplete(false);
    setActiveStep(0);

    // Animate through pipeline steps
    const stepDurations = [600, 700, 900, 800, 600, 500];

    for (let i = 0; i < 6; i++) {
      setActiveStep(i);
      await new Promise(resolve => setTimeout(resolve, stepDurations[i]));
    }

    try {
      await analyzeSingleResume(resume, jobDescription);
      setIsComplete(true);

      // Wait a moment to show completion, then close overlay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOverlay(false);
      setActiveStep(-1);

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      setActiveStep(-1);
      setShowOverlay(false);
      toast.error("Analysis failed. Please try again.");
    }
  };

  const handleFileSelect = (file: File) => {
    setResume(file);
    if (results) reset();
  };

  return (
    <Layout>
      <Head>
        <title>Analyze Resume - ResuMatch</title>
      </Head>
      <Toaster position="top-right" />

      {/* Fullscreen Analysis Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)' }}
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: 0.1,
                  }}
                  animate={{
                    opacity: [0.1, 0.5, 0.1],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Glowing orbs */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px]"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #E040FB)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px]"
              style={{ background: 'linear-gradient(135deg, #E040FB, #00D9FF)' }}
            />

            {/* Main Content */}
            <div className="relative z-10 max-w-2xl mx-auto px-8 text-center">
              {/* Floating Document */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-12"
              >
                <div className="relative inline-block">
                  {/* Document card */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        `0 0 40px ${stages[activeStep]?.color || '#FF6B35'}40`,
                        `0 0 80px ${stages[activeStep]?.color || '#FF6B35'}60`,
                        `0 0 40px ${stages[activeStep]?.color || '#FF6B35'}40`,
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-32 h-40 bg-white rounded-2xl flex flex-col items-center justify-center p-4 mx-auto"
                    style={{ borderColor: stages[activeStep]?.color, borderWidth: 3 }}
                  >
                    <div className="space-y-2 w-full">
                      <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto" />
                      <div className="h-2 bg-gray-200 rounded w-full" />
                      <div className="h-2 bg-gray-200 rounded w-2/3 mx-auto" />
                      <div className="h-2 bg-gray-200 rounded w-4/5 mx-auto" />
                      <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
                    </div>
                  </motion.div>

                  {/* Sparkle effect */}
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                    className="absolute -top-4 -right-4"
                  >
                    <Sparkles className="w-10 h-10" style={{ color: stages[activeStep]?.color }} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Stage info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12"
                >
                  {!isComplete ? (
                    <>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        {stages[activeStep]?.label || 'Processing...'}
                      </h2>
                      <p className="text-lg text-gray-400">
                        {stages[activeStep]?.description}
                      </p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle className="w-10 h-10 text-white" />
                      </motion.div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Analysis Complete!
                      </h2>
                      <p className="text-lg text-gray-400">
                        Loading your results...
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Progress steps */}
              <div className="flex justify-center items-center gap-3">
                {stages.map((stage, i) => {
                  const isActive = activeStep === i;
                  const isCompleted = activeStep > i || isComplete;
                  const Icon = stage.icon;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{
                          scale: isActive ? 1.2 : 1,
                          boxShadow: isActive ? `0 0 30px ${stage.color}` : 'none',
                        }}
                        className={`
                          w-12 h-12 rounded-xl flex items-center justify-center transition-all
                          ${isCompleted ? 'bg-green-500' : isActive ? 'bg-white' : 'bg-white/10'}
                        `}
                        style={{
                          borderColor: isActive ? stage.color : 'transparent',
                          borderWidth: isActive ? 2 : 0,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Icon
                            className="w-6 h-6"
                            style={{ color: isActive ? stage.color : '#6B7280' }}
                          />
                        )}
                      </motion.div>

                      {/* Pulse ring */}
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-0 rounded-xl"
                          style={{ border: `2px solid ${stage.color}` }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-8 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${((activeStep + 1) / stages.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FF6B35, #E040FB, #00D9FF)' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-white pt-24 pb-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-llama-orange-500 to-llama-cyan-500 mb-6"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Resume Analysis Engine
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Upload your resume and watch our AI analyze it in real-time.
              See exactly how your document flows through our intelligent processing pipeline.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Form */}
          <AnimatePresence mode="wait">
            {!results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AnalysisForm
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  onFileSelect={handleFileSelect}
                  resume={resume}
                  onRemoveResume={() => setResume(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {results && (
              <motion.div
                id="results-section"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-8 text-center">
                  <button
                    onClick={() => {
                      reset();
                      setResume(null);
                      setJobDescription('');
                    }}
                    className="px-6 py-3 border-2 border-black text-black text-sm font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
                  >
                    Analyze Another Resume
                  </button>
                </div>

                <ResultsDashboard result={results} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
