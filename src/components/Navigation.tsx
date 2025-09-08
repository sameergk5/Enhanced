import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
	const navigate = useNavigate();
	const location = useLocation();

	const handleNavigation = (path: string) => {
		navigate(path);
	};

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	return (
		<header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo and Brand */}
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
							<div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-white" />
							</div>
							<h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
								Wardrobe AI
							</h1>
						</div>
						<span className="text-blue-200 text-sm hidden md:block">
							Powered by Sameer
						</span>
					</div>

					{/* Navigation */}
					<nav className="flex items-center space-x-4">
						<Button
							variant="ghost"
							className={`text-white hover:bg-white/10 ${isActive('/') ? 'bg-white/20' : ''}`}
							onClick={() => handleNavigation('/')}
						>
							Features
						</Button>
						<Button
							variant="ghost"
							className={`text-white hover:bg-white/10 ${isActive('/virtual-wardrobe') ? 'bg-white/20' : ''}`}
							onClick={() => handleNavigation('/virtual-wardrobe')}
						>
							Virtual Wardrobe
						</Button>
						<Button
							variant="ghost"
							className="text-white hover:bg-white/10"
							onClick={() => handleNavigation('/dashboard')}
						>
							Community
						</Button>
						<Button
							variant="ghost"
							className="text-white hover:bg-white/10"
							onClick={() => handleNavigation('/virtual-wardrobe')}
						>
							AI Styling
						</Button>
					</nav>

					{/* Right Side */}
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2 text-white">
							<div className="w-6 h-6 bg-gray-400 rounded-full"></div>
							<span>Virtual Wardrobe</span>
						</div>
						<Button
							variant="outline"
							className="border-white/30 text-white hover:bg-white/10"
							onClick={() => handleNavigation('/')}
						>
							Logout
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
