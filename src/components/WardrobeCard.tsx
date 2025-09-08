import { motion } from 'framer-motion'
import React from 'react'
import '../styles/3d-enhancements.css'

interface WardrobeCardProps {
	title: string
	description: string
	backContent: string
	icon: string
	color: string
	onClick?: () => void
}

const WardrobeCard: React.FC<WardrobeCardProps> = ({
	title,
	description,
	backContent,
	icon,
	color,
	onClick
}) => {
	return (
		<motion.div
			className="wardrobe-card w-64 h-80 m-4"
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={onClick}
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<div className="wardrobe-card-inner">
				<div className="wardrobe-card-front flex flex-col items-center justify-center">
					<div className="text-6xl mb-4">{icon}</div>
					<h3 className="text-2xl font-bold mb-2">{title}</h3>
					<p className="text-sm opacity-90">{description}</p>
				</div>

				<div className="wardrobe-card-back flex flex-col items-center justify-center">
					<div className="text-4xl mb-4">✨</div>
					<p className="text-lg text-center">{backContent}</p>
					<motion.button
						className="mt-4 px-6 py-2 bg-white/20 rounded-full text-white font-semibold hover:bg-white/30 transition-all duration-300"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
					>
						Explore
					</motion.button>
				</div>
			</div>
		</motion.div>
	)
}

export default WardrobeCard
