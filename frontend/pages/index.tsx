import React, { useState } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import WorkflowSection from '../components/WorkflowSection';
import Features from '../components/Features';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, Code, Database, Server, Cpu, Layers, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const techStack = [
  { icon: Cpu, name: 'OpenAI', color: '#10A37F' },
  { icon: Layers, name: 'Next.js', color: '#000000' },
  { icon: Server, name: 'FastAPI', color: '#009688' },
  { icon: Database, name: 'TensorFlow', color: '#FF6F00' },
  { icon: Code, name: 'Python', color: '#3776AB' },
];

export default function Home() {
  const [hoveredTech, setHoveredTech] = useState<number | null>(null);

  return (
    <Layout>
      <Head>
        <title>ResuMatch - AI-Powered Resume Analysis</title>
        <meta name="description" content="The new standard for resume analysis. AI-powered semantic matching, skill gap detection, and personalized career roadmaps." />
      </Head>

      {/* Hero Section */}
      <Hero />

      {/* Workflow Visualization - Main Feature */}
      <WorkflowSection />

      {/* Features / Core Framework */}
      <Features />

      {/* Tech Stack Section - Animated */}
      <section className="py-20 bg-white border-t border-gray-100 relative overflow-hidden">
        {/* Background floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-gray-200"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [null, `${Math.random() * 100}%`],
                x: [null, `${Math.random() * 100}%`],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Built with modern AI technology
            </motion.p>

            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredTech(index)}
                  onMouseLeave={() => setHoveredTech(null)}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      y: hoveredTech === index ? -5 : 0,
                      scale: hoveredTech === index ? 1.1 : 1,
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    style={{
                      backgroundColor: hoveredTech === index ? `${tech.color}10` : 'transparent',
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: hoveredTech === index ? [0, -10, 10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <tech.icon
                        className="w-5 h-5 transition-colors"
                        style={{ color: hoveredTech === index ? tech.color : '#9CA3AF' }}
                      />
                    </motion.div>
                    <span
                      className="text-lg font-semibold transition-colors"
                      style={{ color: hoveredTech === index ? tech.color : '#9CA3AF' }}
                    >
                      {tech.name}
                    </span>
                  </motion.div>

                  {/* Hover glow effect */}
                  {hoveredTech === index && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.15, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-lg blur-xl -z-10"
                      style={{ backgroundColor: tech.color }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Animated with Gradient */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Animated gradient bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 origin-left"
        />

        {/* Floating background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 w-72 h-72 rounded-full bg-llama-orange-500/5 blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-llama-cyan-500/5 blur-3xl"
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-llama-orange-500/80 to-llama-cyan-500/80 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Ready to optimize your career?
            </h2>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Join thousands of professionals using AI-powered resume analysis to land their dream jobs.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* Animated CTA button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/analyze"
                  className="group relative px-8 py-4 bg-black text-white text-sm font-semibold tracking-wide uppercase inline-flex items-center overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  />
                  <span className="relative">Start Free Analysis</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="relative ml-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
              >
                <Link
                  href="/about"
                  className="px-8 py-4 text-gray-600 font-medium hover:text-black transition-colors inline-flex items-center"
                >
                  Learn more
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>AI-powered analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
                />
                <span>Results in seconds</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
