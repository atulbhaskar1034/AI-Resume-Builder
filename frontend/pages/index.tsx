import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import HowAIThinks from '../components/HowAIThinks';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, Code, Database, Server, Cpu, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>ResuMatch - Semantic Resume Intelligence</title>
        <meta name="description" content="AI-powered resume analysis and career roadmap generator." />
      </Head>

      <Hero />
      <HowItWorks />
      <HowAIThinks />

      {/* Tech Stack / Trust Section */}
      <section className="py-24 border-t border-slate-100 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-12">
              Built with modern AI technology
            </p>

            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {/* Technology Logos with Icons */}
              <div className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <Cpu className="w-6 h-6 text-slate-700" />
                <span className="text-xl font-bold text-slate-700">OpenAI</span>
              </div>
              <div className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <Layers className="w-6 h-6 text-slate-700" />
                <span className="text-xl font-bold text-slate-700">Next.js</span>
              </div>
              <div className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <Server className="w-6 h-6 text-slate-700" />
                <span className="text-xl font-bold text-slate-700">FastAPI</span>
              </div>
              <div className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <Database className="w-6 h-6 text-slate-700" />
                <span className="text-xl font-bold text-slate-700">TensorFlow</span>
              </div>
              <div className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <Code className="w-6 h-6 text-slate-700" />
                <span className="text-xl font-bold text-slate-700">Python</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-llama-indigo-600 rounded-full blur-[128px] opacity-30 animate-pulse-subtle"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-llama-teal-600 rounded-full blur-[128px] opacity-20 animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-llama-teal-400 to-llama-indigo-400">Unlock</span> Your Career?
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Join thousands of candidates who are optimizing their resumes with semantic intelligence.
              Stop guessing what recruiters want—let our AI show you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/analyze"
                className="btn-primary w-full sm:w-auto px-8 py-4 text-lg shadow-xl shadow-indigo-900/20 inline-flex items-center justify-center"
              >
                Start Free Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 text-white font-medium hover:text-llama-teal-300 transition-colors inline-flex items-center"
              >
                Learn more &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
