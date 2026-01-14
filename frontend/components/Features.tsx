import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Brain, Target, BarChart3, GraduationCap, Bot, ArrowRight, Sparkles } from 'lucide-react';

const features = [
	{
		icon: FileText,
		title: 'Parser',
		description: 'Multi-format document parsing for PDFs, DOCX, and text files with intelligent text extraction.',
		color: '#FF6B35',
		gradient: 'from-orange-500 to-red-500',
	},
	{
		icon: Brain,
		title: 'Similarity Engine',
		description: 'TF-IDF and semantic embeddings for deep contextual matching between resumes and job descriptions.',
		color: '#E040FB',
		gradient: 'from-purple-500 to-pink-500',
	},
	{
		icon: Target,
		title: 'Gap Analyzer',
		description: 'Identifies missing skills based on market trends and role requirements with importance scoring.',
		color: '#6366F1',
		gradient: 'from-indigo-500 to-blue-500',
	},
	{
		icon: BarChart3,
		title: 'Skill Heatmap',
		description: 'Visual proficiency display with red-to-green color grading based on match percentages.',
		color: '#10B981',
		gradient: 'from-green-500 to-emerald-500',
	},
	{
		icon: GraduationCap,
		title: 'Course Recommender',
		description: 'Personalized learning roadmap with curated courses from NPTEL and top educational platforms.',
		color: '#00D9FF',
		gradient: 'from-cyan-500 to-blue-500',
	},
	{
		icon: Bot,
		title: 'AI Chatbot',
		description: 'Interactive career assistant for personalized advice and resume optimization tips.',
		color: '#F59E0B',
		gradient: 'from-amber-500 to-orange-500',
	},
];

export default function Features() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

	return (
		<section id="features" className="py-24 bg-gray-50 relative overflow-hidden">
			{/* Animated background particles */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				{[...Array(15)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-llama-orange-500/10 to-llama-cyan-500/10"
						initial={{
							x: Math.random() * 100 + '%',
							y: Math.random() * 100 + '%',
						}}
						animate={{
							y: [null, '-100%'],
							opacity: [0, 0.5, 0],
						}}
						transition={{
							duration: 8 + Math.random() * 4,
							repeat: Infinity,
							delay: Math.random() * 5,
						}}
					/>
				))}
			</div>

			<div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
				{/* Section Header with animation */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mb-16"
				>
					<motion.div
						initial={{ scale: 0 }}
						whileInView={{ scale: 1 }}
						viewport={{ once: true }}
						className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-llama-orange-500/80 to-llama-cyan-500/80 mb-6"
					>
						<Sparkles className="w-8 h-8 text-white" />
					</motion.div>

					<h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
						ResuMatch Core Framework
					</h2>
					<p className="text-lg text-gray-500 max-w-2xl mx-auto">
						Modular building blocks powering intelligent resume analysis
					</p>
				</motion.div>

				{/* Feature Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						const isHovered = hoveredIndex === index;

						return (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
								onClick={() => setSelectedFeature(selectedFeature === index ? null : index)}
								className="relative cursor-pointer group"
							>
								{/* Card */}
								<motion.div
									animate={{
										y: isHovered ? -8 : 0,
										boxShadow: isHovered
											? `0 20px 40px ${feature.color}15`
											: '0 4px 6px rgba(0,0,0,0.05)',
									}}
									transition={{ duration: 0.3 }}
									className="relative bg-white rounded-2xl p-8 border border-gray-100 h-full overflow-hidden"
								>
									{/* Subtle gradient overlay on hover - REDUCED OPACITY */}
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: isHovered ? 0.03 : 0 }}
										className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient}`}
									/>

									{/* Corner accent - REDUCED OPACITY */}
									<motion.div
										animate={{
											scale: isHovered ? 1.5 : 1,
											opacity: isHovered ? 0.08 : 0.04,
										}}
										className="absolute -top-10 -right-10 w-32 h-32 rounded-full"
										style={{ backgroundColor: feature.color }}
									/>

									{/* Icon with animation */}
									<motion.div
										animate={{
											scale: isHovered ? 1.1 : 1,
											rotate: isHovered ? [0, -5, 5, 0] : 0,
										}}
										transition={{ duration: 0.4 }}
										className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors"
										style={{
											backgroundColor: isHovered ? feature.color + '15' : '#f9fafb',
											border: `2px solid ${isHovered ? feature.color + '40' : '#e5e7eb'}`,
										}}
									>
										<Icon
											className="w-7 h-7 transition-colors"
											style={{ color: isHovered ? feature.color : '#6b7280' }}
										/>

										{/* Pulse effect on hover */}
										{isHovered && (
											<motion.div
												initial={{ scale: 1, opacity: 0.3 }}
												animate={{ scale: 1.5, opacity: 0 }}
												transition={{ duration: 0.8, repeat: Infinity }}
												className="absolute inset-0 rounded-xl"
												style={{ border: `2px solid ${feature.color}50` }}
											/>
										)}
									</motion.div>

									{/* Title */}
									<motion.h3
										animate={{ color: isHovered ? feature.color : '#111827' }}
										className="relative z-10 text-xl font-bold mb-3 transition-colors"
									>
										{feature.title}
									</motion.h3>

									{/* Description */}
									<p className="relative z-10 text-gray-500 text-sm leading-relaxed mb-4">
										{feature.description}
									</p>

									{/* Learn more link */}
									<motion.div
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
										className="relative z-10 flex items-center text-sm font-medium"
										style={{ color: feature.color }}
									>
										<span>Learn more</span>
										<motion.div
											animate={{ x: isHovered ? [0, 5, 0] : 0 }}
											transition={{ duration: 0.6, repeat: Infinity }}
										>
											<ArrowRight className="w-4 h-4 ml-1" />
										</motion.div>
									</motion.div>

									{/* Bottom gradient line - REDUCED OPACITY */}
									<motion.div
										initial={{ scaleX: 0 }}
										animate={{ scaleX: isHovered ? 1 : 0 }}
										transition={{ duration: 0.3 }}
										className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} origin-left opacity-60`}
									/>
								</motion.div>

								{/* Floating particles on hover - REDUCED */}
								<AnimatePresence>
									{isHovered && (
										<>
											{[...Array(3)].map((_, i) => (
												<motion.div
													key={i}
													initial={{
														opacity: 0,
														scale: 0,
														x: '50%',
														y: '50%',
													}}
													animate={{
														opacity: [0, 0.5, 0],
														scale: [0, 1, 0.5],
														x: `${50 + (Math.random() - 0.5) * 100}%`,
														y: `${50 + (Math.random() - 0.5) * 100}%`,
													}}
													exit={{ opacity: 0 }}
													transition={{ duration: 1, delay: i * 0.1 }}
													className="absolute w-1.5 h-1.5 rounded-full pointer-events-none opacity-50"
													style={{ backgroundColor: feature.color }}
												/>
											))}
										</>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</div>

				{/* Bottom CTA Row */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
				>
					{[
						{ title: 'Modular Architecture', desc: 'Each component works independently and integrates seamlessly' },
						{ title: 'Developer-First', desc: 'Built with Python FastAPI backend and Next.js frontend' },
						{ title: 'Open Source', desc: 'Fully customizable and extendable for your needs' },
					].map((item, i) => (
						<motion.div
							key={item.title}
							whileHover={{ y: -4 }}
							className="text-center p-6 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all"
						>
							<motion.div
								initial={{ scale: 0 }}
								whileInView={{ scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.2 + i * 0.1 }}
								className="w-3 h-3 rounded-full bg-gradient-to-r from-llama-orange-500/70 to-llama-cyan-500/70 mx-auto mb-4"
							/>
							<h4 className="text-lg font-bold text-black mb-2">{item.title}</h4>
							<p className="text-sm text-gray-500">{item.desc}</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
