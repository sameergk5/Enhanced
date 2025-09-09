import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
	const navigate = useNavigate();
	const location = useLocation();

	const handleNavigation = (path: string) => {
		navigate(path);
	};

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	return (
		<header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo and Brand */}
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
							<div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-white" />
							</div>
							<h1 className="text-xl font-bold text-white">
								Wardrobe AI
							</h1>
						</div>
						<span className="text-gray-400 text-sm hidden md:block">
							Powered by Sameer
						</span>
					</div>

					{/* Navigation */}
					<nav className="flex items-center space-x-2">
						<Button
							variant="ghost"
							size="sm"
							className={`text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 px-4 py-2 rounded-md ${isActive('/') ? 'text-white bg-gray-700/70' : ''
								}`}
							onClick={() => handleNavigation('/')}
						>
							Features
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className={`text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 px-4 py-2 rounded-md ${isActive('/virtual-wardrobe') || isActive('/virtual-wardrobe-simple') ? 'text-white bg-gray-700/70' : ''
								}`}
							onClick={() => handleNavigation('/virtual-wardrobe')}
						>
							Virtual Wardrobe
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className={`text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 px-4 py-2 rounded-md ${isActive('/dashboard') ? 'text-white bg-gray-700/70' : ''
								}`}
							onClick={() => handleNavigation('/dashboard')}
						>
							Community
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 px-4 py-2 rounded-md"
							onClick={() => handleNavigation('/virtual-wardrobe')}
						>
							AI Styling
						</Button>
					</nav>

					{/* Right Side */}
					<div className="flex items-center space-x-3">
						<div className="flex items-center space-x-2 text-gray-300">
							<div className="w-6 h-6 bg-gray-600 rounded-full border border-gray-500"></div>
							<span className="hidden sm:block text-sm">Virtual Wardrobe</span>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-500 transition-all duration-200 px-4 py-2"
							onClick={() => handleNavigation('/login')}
						>
							Logout
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
