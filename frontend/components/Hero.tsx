import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Sparkles, ArrowRight, Upload, Brain, Network, BarChart } from 'lucide-react';

const workflowSteps = [
	{
		id: '01',
		title: 'Upload Documents',
		description: 'Upload resumes (PDF, DOCX) and job descriptions directly.',
		icon: Upload,
	},
	{
		id: '02',
		title: 'Parse & Extract',
		description: 'AI extracts key skills, experience, and educational background.',
		icon: FileText,
	},
	{
		id: '03',
		title: 'Semantic Match',
		description: 'Vector analysis compares your profile against job requirements.',
		icon: Brain,
	},
	{
		id: '04',
		title: 'Strategic Insights',
		description: 'Get actionable feedback and a personalized career roadmap.',
		icon: BarChart,
	},
];

export default function Hero() {
	return (
		<div className="relative overflow-hidden bg-slate-50 pt-16 pb-32 lg:pt-32 lg:pb-40">
			{/* Background Decorative Elements */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-llama-indigo-100 rounded-full blur-3xl opacity-50" />
				<div className="absolute top-1/2 -left-24 w-72 h-72 bg-llama-teal-100 rounded-full blur-3xl opacity-50" />
			</div>

			<div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
				{/* Badge */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-8"
				>
					<Sparkles className="w-4 h-4 text-llama-indigo-600" />
					<span className="text-sm font-medium text-llama-indigo-700">Next-Gen AI Resume Analysis</span>
				</motion.div>

				{/* Headline */}
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6"
				>
					Semantic Resume Intelligence, <br className="hidden md:block" />
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-llama-indigo-600 to-llama-purple-600">
						Powered by AI
					</span>
				</motion.h1>

				{/* Subheadline */}
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed"
				>
					Stop relying on keyword matching. Our advanced LLM-powered engine understands the
					<i>context</i> of your experience to find your perfect career fit.
				</motion.p>

				{/* CTA Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-24"
				>
					<Link
						href="/analyze"
						className="btn-primary w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-indigo-500/20"
					>
						Analyze Resume
						<ArrowRight className="ml-2 w-4 h-4" />
					</Link>
					<Link
						href="/about"
						className="btn-secondary w-full sm:w-auto h-12 px-8 text-base"
					>
						How it works
					</Link>
				</motion.div>

				{/* Visual Workflow Cards */}
				<div className="w-full max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{workflowSteps.map((step, index) => (
							<motion.div
								key={step.id}
								initial={{ opacity: 0, y: 40 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
								className="bg-white rounded-xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative group hover:-translate-y-1 transition-transform duration-300"
							>
								<div className="absolute top-6 left-6 text-xs font-bold text-slate-300 tracking-widest">
									{step.id}
								</div>
								<div className="mt-8 mb-6 flex justify-center">
									{/* Icon Container */}
									<div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-300">
										<step.icon className="w-8 h-8 text-slate-400 group-hover:text-llama-indigo-600 transition-colors duration-300" />
									</div>
								</div>
								<h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
								<p className="text-sm text-slate-500 leading-relaxed">
									{step.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
