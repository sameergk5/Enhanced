import { Button } from '@/components/ui/Button'
import { Menu, Sparkles, X } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Navigation: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-purple-500/20">
			<div className="container mx-auto px-6">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-white" />
						</div>
						<span className="text-xl font-bold text-white">Wardrobe AI</span>
						<span className="text-sm text-gray-400 ml-2">Powered by Sameer</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						<Link to="/features" className="text-gray-300 hover:text-white transition-colors">
							Features
						</Link>
						<Link to="/virtual-wardrobe" className="text-gray-300 hover:text-white transition-colors">
							Virtual Wardrobe
						</Link>
						<Link to="/community" className="text-gray-300 hover:text-white transition-colors">
							Community
						</Link>
						<Link to="/ai-styling" className="text-gray-300 hover:text-white transition-colors">
							AI Styling
						</Link>

						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="sm"
								className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
							>
								Virtual Wardrobe
							</Button>
							<Button
								size="sm"
								className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
							>
								Logout
							</Button>
						</div>
					</div>

					{/* Mobile menu button */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="md:hidden text-white p-2"
					>
						{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</div>

				{/* Mobile Navigation */}
				{isOpen && (
					<div className="md:hidden py-4 border-t border-purple-500/20">
						<div className="flex flex-col space-y-3">
							<Link
								to="/features"
								className="text-gray-300 hover:text-white transition-colors py-2"
								onClick={() => setIsOpen(false)}
							>
								Features
							</Link>
							<Link
								to="/virtual-wardrobe"
								className="text-gray-300 hover:text-white transition-colors py-2"
								onClick={() => setIsOpen(false)}
							>
								Virtual Wardrobe
							</Link>
							<Link
								to="/community"
								className="text-gray-300 hover:text-white transition-colors py-2"
								onClick={() => setIsOpen(false)}
							>
								Community
							</Link>
							<Link
								to="/ai-styling"
								className="text-gray-300 hover:text-white transition-colors py-2"
								onClick={() => setIsOpen(false)}
							>
								AI Styling
							</Link>

							<div className="flex flex-col gap-3 pt-4">
								<Button
									variant="outline"
									size="sm"
									className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
								>
									Virtual Wardrobe
								</Button>
								<Button
									size="sm"
									className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
								>
									Logout
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	)
}

export default Navigation
