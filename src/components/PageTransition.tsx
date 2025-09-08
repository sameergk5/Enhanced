import { motion } from 'framer-motion'
import React from 'react'

interface PageTransitionProps {
	children: React.ReactNode
	className?: string
}

const pageVariants = {
	initial: {
		opacity: 0,
		y: 50,
		rotateX: -15,
		scale: 0.95
	},
	in: {
		opacity: 1,
		y: 0,
		rotateX: 0,
		scale: 1
	},
	out: {
		opacity: 0,
		y: -50,
		rotateX: 15,
		scale: 1.05
	}
}

const pageTransition = {
	type: "spring",
	stiffness: 100,
	damping: 20,
	mass: 1,
	duration: 0.6
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
	return (
		<motion.div
			className={`page-transition ${className}`}
			initial="initial"
			animate="in"
			exit="out"
			variants={pageVariants}
			transition={pageTransition}
			style={{
				transformOrigin: "center",
				transformStyle: "preserve-3d"
			}}
		>
			{children}
		</motion.div>
	)
}

// Enhanced transition with custom effects
interface EnhancedPageTransitionProps extends PageTransitionProps {
	effect?: 'slide' | 'fade' | 'scale' | 'rotate' | 'portal'
}

const EnhancedPageTransition: React.FC<EnhancedPageTransitionProps> = ({
	children,
	className = "",
	effect = 'slide'
}) => {
	const getVariants = () => {
		switch (effect) {
			case 'fade':
				return {
					initial: { opacity: 0 },
					in: { opacity: 1 },
					out: { opacity: 0 }
				}
			case 'scale':
				return {
					initial: { opacity: 0, scale: 0.8 },
					in: { opacity: 1, scale: 1 },
					out: { opacity: 0, scale: 1.2 }
				}
			case 'rotate':
				return {
					initial: { opacity: 0, rotateY: -90 },
					in: { opacity: 1, rotateY: 0 },
					out: { opacity: 0, rotateY: 90 }
				}
			case 'portal':
				return {
					initial: {
						opacity: 0,
						scale: 0,
						rotateZ: 180,
						borderRadius: "50%"
					},
					in: {
						opacity: 1,
						scale: 1,
						rotateZ: 0,
						borderRadius: "0%"
					},
					out: {
						opacity: 0,
						scale: 2,
						rotateZ: -180,
						borderRadius: "50%"
					}
				}
			default: // slide
				return pageVariants
		}
	}

	return (
		<motion.div
			className={`enhanced-page-transition ${className}`}
			initial="initial"
			animate="in"
			exit="out"
			variants={getVariants()}
			transition={pageTransition}
			style={{
				transformOrigin: "center",
				transformStyle: "preserve-3d"
			}}
		>
			{children}
		</motion.div>
	)
}

export default PageTransition
export { EnhancedPageTransition }
