import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import {
  Brain,
  Target,
  Zap,
  Users,
  Award,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Text Processing',
    description: 'Natural language processing pipeline with entity recognition and skill extraction.',
  },
  {
    icon: Target,
    title: 'Similarity Analysis',
    description: 'Semantic similarity calculation using transformer-based sentence embeddings.',
  },
  {
    icon: Zap,
    title: 'Multi-Format Input',
    description: 'Text extraction from PDF, DOC, DOCX, TXT, and image files.',
  },
  {
    icon: Users,
    title: 'Batch Processing',
    description: 'API endpoints for processing multiple files programmatically.',
  },
  {
    icon: Award,
    title: 'Component Scoring',
    description: 'Detailed analysis across skills, experience, education, and keyword matching.',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Solution',
    description: 'Built with modern architecture for growing recruitment needs.',
  },
];

const stats = [
  { number: 'AI', label: 'Powered Analysis' },
  { number: 'NLP', label: 'Text Processing' },
  { number: 'Open', label: 'Source Code' },
  { number: 'Python', label: 'Backend Tech' },
];

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About ResuMatch - Semantic Resume Intelligence</title>
        <meta
          name="description"
          content="Learn about ResuMatch's AI-powered resume analysis platform using natural language processing and machine learning algorithms."
        />
      </Head>

      <div className="relative overflow-hidden pt-12 pb-24">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-llama-indigo-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-llama-teal-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-llama-indigo-600 to-llama-purple-600">ResuMatch</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're transforming recruitment by replacing keyword matching with deep semantic understanding.
              Our AI analyzes the <i>context</i> of careers, not just the text.
            </p>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-10 md:p-14 mb-20 text-center bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-xl"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
                "To democratize access to advanced career intelligence. ResuMatch guarantees that every candidate's
                story is understood through sophisticated AI analysis, bridging the gap between talent and opportunity
                with unmatched precision."
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900">Platform Features</h2>
              <p className="text-slate-500 mt-4">Built with cutting-edge technology for precise analysis</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="glass-card p-8 group hover:border-llama-indigo-200 hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-llama-indigo-600 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-llama-indigo-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats / Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-slate-900 rounded-3xl p-12 md:p-16 mb-24 relative overflow-hidden"
          >
            {/* Decorative noise/gradient */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-llama-indigo-600 rounded-full blur-[100px] opacity-20"></div>

            <div className="relative z-10 text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Powered by Advanced LLMs
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Merging traditional NLP with state-of-the-art vector embeddings.
              </p>
            </div>
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-slate-800 pt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                    {stat.number}
                  </div>
                  <div className="text-llama-teal-400 font-medium tracking-wide text-sm uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-24"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Enterprise-Grade Architecture
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  ResuMatch isn't just a prototype; it's built on a robust, scalable stack designed for accuracy.
                  We utilize FAISS for vector similarity search and transformer models for context-aware embeddings.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Shield className="w-6 h-6 text-llama-indigo-600 mr-4 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">Secure Data Processing</h4>
                      <p className="text-sm text-slate-500">Local processing capabilities for privacy.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-6 h-6 text-llama-indigo-600 mr-4 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">Real-time Inference</h4>
                      <p className="text-sm text-slate-500">Sub-second analysis for instant feedback.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <TrendingUp className="w-6 h-6 text-llama-indigo-600 mr-4 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">Continuous Learning</h4>
                      <p className="text-sm text-slate-500">Models that adapt to new job market terminologies.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass-card p-8 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Core Technologies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-llama-indigo-200 transition-colors">
                    <h4 className="font-bold text-slate-900 mb-1">NLP & Transformers</h4>
                    <p className="text-xs text-slate-500">Spacy & HuggingFace</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-llama-indigo-200 transition-colors">
                    <h4 className="font-bold text-slate-900 mb-1">Vector Search</h4>
                    <p className="text-xs text-slate-500">Semantic Similarity</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-llama-indigo-200 transition-colors">
                    <h4 className="font-bold text-slate-900 mb-1">FastAPI</h4>
                    <p className="text-xs text-slate-500">High-perf Async Python</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-llama-indigo-200 transition-colors">
                    <h4 className="font-bold text-slate-900 mb-1">Next.js & React</h4>
                    <p className="text-xs text-slate-500">Interactive UI</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
            <div className="glass-card p-12 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Experience the power of AI-driven resume analysis. Stop guessing, start matching.
              </p>
              <Link
                href="/analyze"
                className="btn-primary inline-flex items-center text-lg px-8 py-4 shadow-xl shadow-llama-indigo-500/20"
              >
                <Zap className="w-5 h-5 mr-2" />
                Try it Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
