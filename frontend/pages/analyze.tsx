import React, { useState } from 'react';
import Head from 'next/head';
import { Toaster, toast } from 'react-hot-toast';
import Layout from '@/components/Layout';
import AnalysisForm from '@/components/AnalysisForm';
import ResultsDashboard from '@/components/ResultsDashboard';
import AnalysisOverlay from '@/components/AnalysisOverlay';
import ChatWidget from '@/components/ChatWidget';
import { useAnalysis } from '@/hooks/useAnalysis';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';


export default function Analyze() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const {
    isLoading,
    results,
    error,
    analyzeSingleResume,
    setResultsDirectly,
    reset
  } = useAnalysis();

  const handleAnalyze = () => {
    if (!resume) return;
    setShowOverlay(true);
  };

  const handleAnalysisComplete = async (result: any) => {
    // Debug: Log the received SSE result
    console.log('SSE Result received:', JSON.stringify(result, null, 2));
    console.log('role_detected:', result?.role_detected);

    // Use the SSE result directly (includes skill_radar) instead of re-fetching
    setResultsDirectly(result);
    setShowOverlay(false);

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleAnalysisError = (error: string) => {
    setShowOverlay(false);
    toast.error(error || "Analysis failed. Please try again.");
  };

  // Handle clicking on a skill gap in the heatmap
  const handleSkillClick = (skill: string) => {
    setSelectedSkill(skill);
  };

  const handleInitialSkillHandled = () => {
    setSelectedSkill(null);
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
        {showOverlay && resume && (
          <AnalysisOverlay
            resume={resume}
            jobDescription={jobDescription}
            onComplete={handleAnalysisComplete}
            onError={handleAnalysisError}
          />
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

                <ResultsDashboard result={results} onSkillClick={handleSkillClick} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Widget with Analysis Context */}
      <ChatWidget
        analysisResult={results}
        initialSkill={selectedSkill}
        onInitialSkillHandled={handleInitialSkillHandled}
      />
    </Layout>
  );
}
