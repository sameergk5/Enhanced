import React, { useEffect, useState } from 'react'
import '../styles/3d-enhancements.css'

const InteractiveCursor: React.FC = () => {
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isHovering, setIsHovering] = useState(false)

	useEffect(() => {
		const updatePosition = (e: MouseEvent) => {
			setPosition({ x: e.clientX, y: e.clientY })
		}

		const handleMouseEnter = () => setIsHovering(true)
		const handleMouseLeave = () => setIsHovering(false)

		// Add event listeners for mouse movement
		window.addEventListener('mousemove', updatePosition)

		// Add event listeners for interactive elements
		const interactiveElements = document.querySelectorAll('button, a, .interactive')
		interactiveElements.forEach(el => {
			el.addEventListener('mouseenter', handleMouseEnter)
			el.addEventListener('mouseleave', handleMouseLeave)
		})

		return () => {
			window.removeEventListener('mousemove', updatePosition)
			interactiveElements.forEach(el => {
				el.removeEventListener('mouseenter', handleMouseEnter)
				el.removeEventListener('mouseleave', handleMouseLeave)
			})
		}
	}, [])

	return (
		<div
			className={`interactive-cursor ${isHovering ? 'hover' : ''}`}
			style={{
				left: position.x - 10,
				top: position.y - 10,
			}}
		/>
	)
}

export default InteractiveCursor
