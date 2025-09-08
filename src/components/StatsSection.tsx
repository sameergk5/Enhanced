import { motion } from 'framer-motion'
import React from 'react'

const StatsSection: React.FC = () => {
	const stats = [
		{
			number: "10K+",
			label: "Outfits Created",
			gradient: "from-purple-400 to-purple-600"
		},
		{
			number: "5K+",
			label: "Style Twins Found",
			gradient: "from-pink-400 to-red-500"
		},
		{
			number: "98%",
			label: "Love Their Look",
			gradient: "from-blue-400 to-blue-600"
		}
	]

	return (
		<section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<div className="container mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
					{stats.map((stat, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.2, duration: 0.6 }}
							className="text-center"
						>
							<div className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
								{stat.number}
							</div>
							<div className="text-gray-300 text-lg font-medium">
								{stat.label}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}

export default StatsSection
