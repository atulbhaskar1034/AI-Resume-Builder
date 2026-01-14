import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { FileText, Search, Brain, Target, BarChart3, GraduationCap, Sparkles } from 'lucide-react';
import Link from 'next/link';

const workflowSteps = [
    {
        id: 1,
        title: 'Document Upload',
        subtitle: 'PDF, DOCX, TXT',
        description: 'Your resume enters our intelligent parsing engine for text extraction',
        icon: FileText,
        color: '#FF6B35',
        bgColor: 'rgba(255, 107, 53, 0.1)',
    },
    {
        id: 2,
        title: 'Skill Extraction',
        subtitle: 'NLP Processing',
        description: 'AI identifies and extracts skills, experience levels, and education',
        icon: Search,
        color: '#FF8E72',
        bgColor: 'rgba(255, 142, 114, 0.1)',
    },
    {
        id: 3,
        title: 'Semantic Analysis',
        subtitle: 'Vector Embeddings',
        description: 'Deep contextual understanding of your profile using AI models',
        icon: Brain,
        color: '#E040FB',
        bgColor: 'rgba(224, 64, 251, 0.1)',
    },
    {
        id: 4,
        title: 'Gap Detection',
        subtitle: 'Market Comparison',
        description: 'Compare your skills against role requirements and market trends',
        icon: Target,
        color: '#A855F7',
        bgColor: 'rgba(168, 85, 247, 0.1)',
    },
    {
        id: 5,
        title: 'Heatmap Generation',
        subtitle: 'Visual Scoring',
        description: 'Color-coded proficiency visualization from red to green',
        icon: BarChart3,
        color: '#6366F1',
        bgColor: 'rgba(99, 102, 241, 0.1)',
    },
    {
        id: 6,
        title: 'Roadmap Creation',
        subtitle: '6-Month Plan',
        description: 'Personalized learning path with curated course recommendations',
        icon: GraduationCap,
        color: '#00D9FF',
        bgColor: 'rgba(0, 217, 255, 0.1)',
    },
];

// Individual step component with scroll-triggered animation
function WorkflowStep({ step, index }: { step: typeof workflowSteps[0], index: number }) {
    const ref = useRef(null);
    // Only trigger when element is 30% visible - not before
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const Icon = step.icon;

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,  // Completely invisible
                scale: 0.7,
                x: index % 2 === 0 ? -120 : 120,
                y: 50,
                filter: 'blur(10px)'
            }}
            animate={isInView ? {
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                filter: 'blur(0px)'
            } : {
                opacity: 0,  // Stay invisible until in view
                scale: 0.7,
                x: index % 2 === 0 ? -120 : 120,
                y: 50,
                filter: 'blur(10px)'
            }}
            transition={{
                duration: 1.8,  // Very slow
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1], // Custom smooth curve
            }}
            className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
        >
            {/* Content Card with glow */}
            <motion.div
                initial={{
                    boxShadow: 'none',
                    borderColor: 'transparent',
                    background: 'transparent'
                }}
                animate={isInView ? {
                    boxShadow: [
                        'none',
                        `0 0 80px ${step.color}40, 0 0 120px ${step.color}20`,
                        `0 0 60px ${step.color}25, 0 20px 50px rgba(0,0,0,0.1)`
                    ],
                    borderColor: step.color + '60',
                    background: step.bgColor
                } : {}}
                transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
                whileHover={{
                    scale: 1.02,
                    y: -10,
                    boxShadow: `0 0 100px ${step.color}40, 0 30px 60px rgba(0,0,0,0.15)`
                }}
                className="flex-1 p-7 rounded-2xl border-2 transition-all relative overflow-hidden"
                style={{ backgroundColor: step.bgColor }}
            >
                {/* Animated glow pulse overlay */}
                {isInView && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: [0, 0.8, 0.4],
                            scale: [0.5, 1.2, 1]
                        }}
                        transition={{ duration: 3, delay: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 pointer-events-none rounded-2xl"
                        style={{
                            background: `radial-gradient(ellipse at center, ${step.color}20 0%, transparent 60%)`,
                        }}
                    />
                )}

                <div className="relative flex items-start gap-4">
                    {/* Icon with slow spin-in */}
                    <motion.div
                        initial={{ scale: 0, rotate: -270, opacity: 0 }}
                        animate={isInView ? { scale: 1, rotate: 0, opacity: 1 } : {}}
                        transition={{ duration: 1.2, delay: 1.0, type: "spring", damping: 10, stiffness: 80 }}
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                        style={{ backgroundColor: step.color + '25' }}
                    >
                        <Icon className="w-7 h-7" style={{ color: step.color }} />

                        {/* Icon glow ring */}
                        {isInView && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [1, 1.8, 1.5], opacity: [0, 0.6, 0] }}
                                transition={{ duration: 1.5, delay: 1.2 }}
                                className="absolute inset-0 rounded-xl"
                                style={{ border: `2px solid ${step.color}` }}
                            />
                        )}
                    </motion.div>

                    <div className="flex-1">
                        <motion.span
                            initial={{ opacity: 0, y: 20, x: -10 }}
                            animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
                            transition={{ duration: 1.0, delay: 1.4, ease: "easeOut" }}
                            className="text-xs font-bold uppercase tracking-wider inline-block"
                            style={{ color: step.color }}
                        >
                            {step.subtitle}
                        </motion.span>
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 1.0, delay: 1.6, ease: "easeOut" }}
                            className="text-xl font-bold text-gray-900 mt-1"
                        >
                            {step.title}
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 1.0, delay: 1.8, ease: "easeOut" }}
                            className="text-gray-500 mt-2 leading-relaxed"
                        >
                            {step.description}
                        </motion.p>
                    </div>
                </div>
            </motion.div>

            {/* Center node placeholder for alignment */}
            <div className="w-20 flex-shrink-0" />

            {/* Empty space for alternating layout */}
            <div className="flex-1" />
        </motion.div>
    );
}

export default function WorkflowSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 0.8", "end 0.2"]
    });

    // Timeline fill based on scroll
    const timelineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section ref={containerRef} className="py-24 bg-white relative overflow-hidden min-h-[200vh]">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-96 h-96 bg-llama-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-10 w-96 h-96 bg-llama-magenta-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-llama-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                        Watch your document
                        <br />
                        <span className="bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 bg-clip-text text-transparent">
                            flow through AI
                        </span>
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Scroll down to see how ResuMatch transforms your resume into actionable insights
                    </p>
                </motion.div>

                {/* Main Content Area */}
                <div ref={timelineRef} className="relative">
                    {/* Vertical Timeline Line - Center */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gray-200 rounded-full">
                        <motion.div
                            style={{ height: timelineHeight }}
                            className="w-full bg-gradient-to-b from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 rounded-full"
                        />
                    </div>

                    {/* Steps */}
                    <div className="relative space-y-16 py-8">
                        {workflowSteps.map((step, index) => (
                            <div key={step.id} className="relative">
                                {/* Center Node */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.2 }}
                                        className="w-14 h-14 rounded-full bg-white shadow-lg border-4 flex items-center justify-center"
                                        style={{ borderColor: step.color }}
                                    >
                                        <step.icon className="w-6 h-6" style={{ color: step.color }} />
                                    </motion.div>

                                    {/* Pulse ring */}
                                    <motion.div
                                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full"
                                        style={{ border: `2px solid ${step.color}` }}
                                    />
                                </motion.div>

                                {/* Step Content */}
                                <WorkflowStep step={step} index={index} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-20"
                >
                    <Link
                        href="/analyze"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 transition-colors"
                    >
                        Try It Now
                    </Link>
                    <p className="mt-4 text-sm text-gray-400">
                        No signup required • Free analysis
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
