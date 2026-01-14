import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRight,
  Sparkles,
  Code,
  Cpu,
  Database,
  Layers
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Text Processing',
    description: 'Natural language processing pipeline with entity recognition and skill extraction.',
    color: '#E040FB',
  },
  {
    icon: Target,
    title: 'Similarity Analysis',
    description: 'Semantic similarity calculation using transformer-based sentence embeddings.',
    color: '#6366F1',
  },
  {
    icon: Zap,
    title: 'Multi-Format Input',
    description: 'Text extraction from PDF, DOC, DOCX, TXT, and image files.',
    color: '#FF6B35',
  },
  {
    icon: Users,
    title: 'Batch Processing',
    description: 'API endpoints for processing multiple files programmatically.',
    color: '#10B981',
  },
  {
    icon: Award,
    title: 'Component Scoring',
    description: 'Detailed analysis across skills, experience, education, and keyword matching.',
    color: '#F59E0B',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Solution',
    description: 'Built with modern architecture for growing recruitment needs.',
    color: '#00D9FF',
  },
];

const stats = [
  { number: 'AI', label: 'Powered Analysis', icon: Cpu },
  { number: 'NLP', label: 'Text Processing', icon: Brain },
  { number: 'Open', label: 'Source Code', icon: Code },
  { number: 'Fast', label: 'Real-time Results', icon: Zap },
];

const techStack = [
  { name: 'NLP & Transformers', sub: 'Spacy & HuggingFace', icon: Brain },
  { name: 'Vector Search', sub: 'Semantic Similarity', icon: Database },
  { name: 'FastAPI', sub: 'High-perf Async Python', icon: Zap },
  { name: 'Next.js & React', sub: 'Interactive UI', icon: Layers },
];

export default function About() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredTech, setHoveredTech] = useState<number | null>(null);

  return (
    <Layout>
      <Head>
        <title>About ResuMatch - Semantic Resume Intelligence</title>
        <meta
          name="description"
          content="Learn about ResuMatch's AI-powered resume analysis platform using natural language processing and machine learning algorithms."
        />
      </Head>

      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-[500px] h-[500px] bg-llama-orange-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-llama-cyan-500/5 rounded-full blur-3xl"
          />

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-llama-orange-500/20 to-llama-cyan-500/20"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [null, '-100%'],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-llama-orange-500 to-llama-cyan-500 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 bg-clip-text text-transparent">
                ResuMatch
              </span>
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              We're transforming recruitment by replacing keyword matching with deep semantic understanding.
              Our AI analyzes the <em className="text-gray-700">context</em> of careers, not just the text.
            </p>
          </motion.div>

          {/* Mission Statement - Animated card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-24"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="relative bg-white rounded-2xl p-12 md:p-16 text-center border border-gray-100 shadow-xl overflow-hidden"
            >
              {/* Animated gradient border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 opacity-20"
              />
              <div className="absolute inset-[2px] rounded-2xl bg-white" />

              <div className="relative z-10 max-w-4xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-llama-orange-500 to-llama-cyan-500 mx-auto mb-6 flex items-center justify-center"
                >
                  <Target className="w-6 h-6 text-white" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">Our Mission</h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  "To democratize access to advanced career intelligence. ResuMatch guarantees that every candidate's
                  story is understood through sophisticated AI analysis, bridging the gap between talent and opportunity
                  with unmatched precision."
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Features Grid - Animated */}
          <div className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Platform Features</h2>
              <p className="text-gray-500">Built with cutting-edge technology for precise analysis</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="group"
                >
                  <motion.div
                    animate={{
                      y: hoveredFeature === index ? -8 : 0,
                      boxShadow: hoveredFeature === index
                        ? `0 20px 40px ${feature.color}15`
                        : '0 4px 6px rgba(0,0,0,0.05)',
                    }}
                    className="relative bg-white rounded-xl p-8 border border-gray-100 h-full overflow-hidden"
                  >
                    {/* Animated icon */}
                    <motion.div
                      animate={{
                        scale: hoveredFeature === index ? 1.1 : 1,
                        rotate: hoveredFeature === index ? [0, -5, 5, 0] : 0,
                      }}
                      transition={{ duration: 0.4 }}
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors"
                      style={{
                        backgroundColor: hoveredFeature === index ? `${feature.color}15` : '#f9fafb',
                        border: `2px solid ${hoveredFeature === index ? `${feature.color}40` : '#e5e7eb'}`,
                      }}
                    >
                      <feature.icon
                        className="w-7 h-7 transition-colors"
                        style={{ color: hoveredFeature === index ? feature.color : '#6b7280' }}
                      />

                      {/* Pulse ring */}
                      {hoveredFeature === index && (
                        <motion.div
                          initial={{ scale: 1, opacity: 0.3 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="absolute inset-0 rounded-xl"
                          style={{ border: `2px solid ${feature.color}50` }}
                        />
                      )}
                    </motion.div>

                    <motion.h3
                      animate={{ color: hoveredFeature === index ? feature.color : '#111827' }}
                      className="text-xl font-bold mb-3"
                    >
                      {feature.title}
                    </motion.h3>
                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>

                    {/* Bottom accent line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: hoveredFeature === index ? 1 : 0 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
                      style={{ backgroundColor: feature.color }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats Section - Dark with animations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gray-900 rounded-3xl p-12 md:p-16 mb-24 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: 0.1
                  }}
                  animate={{
                    opacity: [0.1, 0.5, 0.1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-0 right-0 w-96 h-96 bg-llama-orange-500 rounded-full blur-[100px]"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute bottom-0 left-0 w-96 h-96 bg-llama-cyan-500 rounded-full blur-[100px]"
              />
            </div>

            <div className="relative z-10 text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6"
              >
                <Cpu className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Powered by Advanced LLMs
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Merging traditional NLP with state-of-the-art vector embeddings.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-gray-800 pt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center cursor-pointer"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-llama-cyan-400 font-medium tracking-wide text-sm uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                  Enterprise-Grade Architecture
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  ResuMatch isn't just a prototype; it's built on a robust, scalable stack designed for accuracy.
                  We utilize FAISS for vector similarity search and transformer models for context-aware embeddings.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: Shield, title: 'Secure Data Processing', desc: 'Local processing capabilities for privacy.' },
                    { icon: Clock, title: 'Real-time Inference', desc: 'Sub-second analysis for instant feedback.' },
                    { icon: TrendingUp, title: 'Continuous Learning', desc: 'Models that adapt to new job market terminologies.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-start group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4 group-hover:bg-llama-orange-500/10 transition-colors">
                        <item.icon className="w-5 h-5 text-gray-600 group-hover:text-llama-orange-500 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-bold text-black group-hover:text-llama-orange-500 transition-colors">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-black mb-6">Core Technologies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {techStack.map((tech, i) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      onMouseEnter={() => setHoveredTech(i)}
                      onMouseLeave={() => setHoveredTech(null)}
                      whileHover={{ y: -4 }}
                      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-llama-orange-200 transition-all cursor-pointer"
                    >
                      <motion.div
                        animate={{ rotate: hoveredTech === i ? [0, -5, 5, 0] : 0 }}
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mb-3"
                      >
                        <tech.icon className="w-4 h-4 text-gray-600" />
                      </motion.div>
                      <h4 className="font-bold text-black mb-1">{tech.name}</h4>
                      <p className="text-xs text-gray-500">{tech.sub}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA - Animated */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border border-gray-100 shadow-lg overflow-hidden"
            >
              {/* Animated gradient */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-20 bg-gradient-to-r from-llama-orange-500/5 via-llama-magenta-500/5 to-llama-cyan-500/5 blur-3xl"
              />

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-llama-orange-500 to-llama-cyan-500 mb-6"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.div>

                <h2 className="text-3xl font-bold text-black mb-4">
                  Ready to Transform Your Hiring?
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Experience the power of AI-driven resume analysis. Stop guessing, start matching.
                </p>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/analyze"
                    className="group relative inline-flex items-center px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-wide overflow-hidden"
                  >
                    {/* Shimmer */}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    />
                    <Zap className="w-5 h-5 mr-2 relative" />
                    <span className="relative">Try it Free</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="relative ml-2"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
