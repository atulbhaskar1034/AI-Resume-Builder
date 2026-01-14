import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Search, CheckCircle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export default function Hero() {
	return (
		<div className="relative overflow-hidden bg-white pt-24 pb-20">
			{/* Decorative gradient blobs */}
			<div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-llama-orange-500/10 to-llama-coral-400/10 rounded-full blur-3xl" />
			<div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-llama-cyan-500/10 to-llama-magenta-500/10 rounded-full blur-3xl" />

			{/* Floating particles */}
			<div className="absolute inset-0 pointer-events-none">
				{[...Array(6)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-llama-orange-500/30 to-llama-cyan-500/30"
						initial={{
							x: `${20 + Math.random() * 60}%`,
							y: `${20 + Math.random() * 60}%`,
						}}
						animate={{
							y: [null, '-30%'],
							opacity: [0.3, 0.7, 0],
						}}
						transition={{
							duration: 8 + Math.random() * 4,
							repeat: Infinity,
							delay: Math.random() * 3,
						}}
					/>
				))}
			</div>

			<div className="relative max-w-7xl mx-auto px-6 lg:px-8">
				{/* Two Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					{/* Left Column - Headlines */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
					>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring" }}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6"
						>
							<Sparkles className="w-4 h-4 text-llama-orange-500" />
							AI-Powered Career Intelligence
						</motion.div>

						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-[1.1] mb-6">
							The new standard for
							<br />
							<span className="bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 bg-clip-text text-transparent">
								resume analysis
							</span>
						</h1>

						<p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
							Upload your resume and get instant AI-powered analysis: skill gap detection,
							match scoring, and a personalized 6-month career roadmap.
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row items-start gap-4">
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
								<Link
									href="/analyze"
									className="group relative px-8 py-4 bg-black text-white text-sm font-semibold tracking-wide uppercase inline-flex items-center overflow-hidden"
								>
									{/* Shimmer */}
									<motion.div
										animate={{ x: ['-100%', '200%'] }}
										transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
										className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
									/>
									<span className="relative">Analyze Resume</span>
									<motion.div
										animate={{ x: [0, 5, 0] }}
										transition={{ duration: 1, repeat: Infinity }}
										className="relative ml-2"
									>
										<ArrowRight className="w-4 h-4" />
									</motion.div>
								</Link>
							</motion.div>

							<Link
								href="#features"
								className="px-8 py-4 border-2 border-gray-200 text-gray-600 text-sm font-semibold tracking-wide uppercase hover:border-black hover:text-black transition-colors"
							>
								Learn More
							</Link>
						</div>
					</motion.div>

					{/* Right Column - Interactive Resume Illustration */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="relative"
					>
						{/* Main Resume Card */}
						<motion.div
							animate={{ y: [0, -10, 0] }}
							transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
							className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-md mx-auto"
						>
							{/* Resume Header */}
							<div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
								<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-llama-orange-500 to-llama-coral-400 flex items-center justify-center">
									<FileText className="w-7 h-7 text-white" />
								</div>
								<div>
									<div className="h-4 w-32 bg-gray-200 rounded mb-2" />
									<div className="h-3 w-24 bg-gray-100 rounded" />
								</div>
							</div>

							{/* Skills Section */}
							<div className="mb-4">
								<div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
									Detected Skills
								</div>
								<div className="flex flex-wrap gap-2">
									{['Python', 'React', 'SQL', 'AWS'].map((skill, i) => (
										<motion.span
											key={skill}
											initial={{ opacity: 0, scale: 0 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.5 + i * 0.1 }}
											className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
										>
											✓ {skill}
										</motion.span>
									))}
								</div>
							</div>

							{/* Gap Section */}
							<div className="mb-4">
								<div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
									Skill Gaps
								</div>
								<div className="flex flex-wrap gap-2">
									{['Docker', 'K8s'].map((skill, i) => (
										<motion.span
											key={skill}
											initial={{ opacity: 0, scale: 0 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.8 + i * 0.1 }}
											className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600"
										>
											+ {skill}
										</motion.span>
									))}
								</div>
							</div>

							{/* Match Score */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 1 }}
								className="flex items-center justify-between pt-4 border-t border-gray-100"
							>
								<span className="text-sm text-gray-500">Match Score</span>
								<div className="flex items-center gap-2">
									<div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: '78%' }}
											transition={{ delay: 1.2, duration: 1 }}
											className="h-full bg-gradient-to-r from-llama-orange-500 to-green-500 rounded-full"
										/>
									</div>
									<span className="text-lg font-bold text-black">78%</span>
								</div>
							</motion.div>

							{/* Floating decorative elements */}
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
								className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-gradient-to-br from-llama-magenta-500 to-llama-purple-500 opacity-20 blur-sm"
							/>
						</motion.div>

						{/* Floating Feature Cards */}
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6 }}
							className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-lg border border-gray-100 p-4 hidden lg:flex items-center gap-3"
						>
							<motion.div
								animate={{ scale: [1, 1.1, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
								className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"
							>
								<CheckCircle className="w-5 h-5 text-green-600" />
							</motion.div>
							<div>
								<div className="text-sm font-semibold text-black">Skills Matched</div>
								<div className="text-xs text-gray-500">12 of 15 required</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.8 }}
							className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-lg border border-gray-100 p-4 hidden lg:flex items-center gap-3"
						>
							<motion.div
								animate={{ y: [0, -3, 0] }}
								transition={{ duration: 1.5, repeat: Infinity }}
								className="w-10 h-10 rounded-lg bg-llama-orange-100 flex items-center justify-center"
							>
								<TrendingUp className="w-5 h-5 text-llama-orange-500" />
							</motion.div>
							<div>
								<div className="text-sm font-semibold text-black">Career Path</div>
								<div className="text-xs text-gray-500">6-month roadmap</div>
							</div>
						</motion.div>
					</motion.div>
				</div>

				{/* Bottom Gradient Bar */}
				<motion.div
					initial={{ scaleX: 0 }}
					animate={{ scaleX: 1 }}
					transition={{ duration: 1, delay: 0.5 }}
					className="mt-16 h-1 w-full bg-gradient-to-r from-llama-orange-500 via-llama-magenta-500 to-llama-cyan-500 rounded-full origin-left"
				/>

				{/* Trust indicators */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1 }}
					className="mt-8 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400"
				>
					<div className="flex items-center gap-2">
						<motion.div
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="w-2 h-2 rounded-full bg-green-500"
						/>
						<span>Free to analyze</span>
					</div>
					<span>•</span>
					<span>No signup required</span>
					<span>•</span>
					<span>Results in seconds</span>
				</motion.div>
			</div>
		</div>
	);
}
