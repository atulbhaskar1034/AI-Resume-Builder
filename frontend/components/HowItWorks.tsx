import React from 'react';
import { Upload, Cpu, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    {
        icon: Upload,
        title: 'Upload Resume',
        description: 'Drag and drop your PDF resume. We securely parse your professional history without storing personal data.',
    },
    {
        icon: Cpu,
        title: 'AI Analysis',
        description: 'Our semantic engine maps your skills against millions of job descriptions to understand your true market value.',
    },
    {
        icon: BarChart,
        title: 'Get Insights',
        description: 'Receive a comprehensive report with match scores, skill gaps, and a personalized learning roadmap.',
    },
];

export default function HowItWorks() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                        How ResuMatch Works
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Three simple steps to unlock your career potential. Use the power of AI to see what recruiters see.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="relative p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-slate-300 select-none">
                                0{index + 1}
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <step.icon className="w-6 h-6 text-llama-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                {step.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
