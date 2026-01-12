import React, { useState } from 'react';
import Head from 'next/head';
import { Toaster, toast } from 'react-hot-toast';
import Layout from '@/components/Layout';
import AnalysisForm from '@/components/AnalysisForm';
import ResultsDashboard from '@/components/ResultsDashboard';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function Analyze() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');

  const {
    isLoading,
    results,
    error,
    analyzeSingleResume,
    reset
  } = useAnalysis();

  const handleAnalyze = async () => {
    if (!resume) return; // Only resume is strictly required now
    try {
      await analyzeSingleResume(resume, jobDescription);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error("Analysis failed. Please try again.");
    }
  };

  const handleFileSelect = (file: File) => {
    setResume(file);
    // Reset results when a new file is uploaded to avoid stale state visually
    if (results) reset();
  };

  return (
    <Layout>
      <Head>
        <title>Analyze Resume - ResuMatch</title>
      </Head>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Analysis <span className="text-transparent bg-clip-text bg-gradient-to-r from-llama-indigo-600 to-llama-purple-600">Engine</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your resume and the target job description. Our AI will perform a semantic deep-dive to calculate your compatibility.
          </p>
        </div>

        <AnalysisForm
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onFileSelect={handleFileSelect}
          resume={resume}
          onRemoveResume={() => setResume(null)}
        />

        {results && (
          <div id="results-section" className="mt-16 pt-16 border-t border-slate-200">
            <ResultsDashboard result={results} />
          </div>
        )}
      </div>
    </Layout>
  );
}
