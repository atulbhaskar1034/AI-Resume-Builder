import React from 'react';
import { motion } from 'framer-motion';
import { Database, Brain, Network, FileSearch } from 'lucide-react';

const steps = [
    {
        icon: FileSearch,
        title: 'Text Extraction & Parsing',
        description: 'We extract raw text from your PDF and segment it into semantic blocks (Education, Experience, Skills) using NLP.',
    },
    {
        icon: Database,
        title: 'Vector Embeddings',
        description: 'Your profile is converted into high-dimensional vectors (embeddings) that represent the "meaning" behind your words, not just keywords.',
    },
    {
        icon: Network,
        title: 'Semantic Similarity Search',
        description: 'Matches your vector profile against millions of job descriptions to find alignment in latent space.',
    },
    {
        icon: Brain,
        title: 'Skill Gap Inference',
        description: 'Our LLM infers missing skills by conceptually linking your experience to market requirements, even if not explicitly stated.',
    },
];

export default function HowAIThinks() {
    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-3 py-1 rounded-full bg-llama-indigo-900 border border-llama-indigo-700 text-llama-indigo-300 text-sm font-medium mb-4">
                        Under the Hood
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">How Our AI &quot;Thinks&quot;</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        A look into the semantic analysis engine powered by vector databases and Large Language Models.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl hover:bg-slate-800 hover:border-llama-indigo-500/50 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-4 text-llama-teal-400">
                                <step.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-100">{step.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
