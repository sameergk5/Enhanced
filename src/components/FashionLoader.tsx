import { motion } from 'framer-motion'
import React from 'react'
import '../styles/3d-enhancements.css'

interface FashionLoaderProps {
	isVisible: boolean
}

const FashionLoader: React.FC<FashionLoaderProps> = ({ isVisible }) => {
	if (!isVisible) return null

	return (
		<motion.div
			className="fashion-loader"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="text-center space-y-8">
				<div className="runway">
					{[1, 2, 3].map((i) => (
						<motion.div
							key={i}
							className="model"
							initial={{ x: -100, opacity: 0 }}
							animate={{ x: 320, opacity: [0, 1, 0] }}
							transition={{
								duration: 2,
								delay: i * 0.5,
								repeat: Infinity,
								ease: "easeInOut"
							}}
						/>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.8 }}
				>
					<h2 className="text-3xl font-bold text-white mb-4">
						Loading Your Fashion Experience
					</h2>
					<div className="fashion-spinner mx-auto" />
					<p className="text-white/70 mt-4">
						Preparing your 3D wardrobe...
					</p>
				</motion.div>
			</div>
		</motion.div>
	)
}

export default FashionLoader
