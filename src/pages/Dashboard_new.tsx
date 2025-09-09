import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Heart, Home, Plus, Sparkles, Star, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
			{/* Header */}
			<header className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
							Wardrobe AI Dashboard
						</h1>
					</div>
					<Button variant="outline" onClick={() => navigate('/')}>
						<Home className="w-4 h-4 mr-2" />
						Back to Home
					</Button>
				</div>
			</header>

			{/* Welcome Section */}
			<div className="pt-12 pb-6">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
						Welcome to Your Style Hub!
					</h1>
					<p className="text-xl text-gray-600 mb-8">
						Manage your digital wardrobe and get AI-powered style recommendations
					</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg border border-purple-100">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
								<Plus className="w-6 h-6 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Total Items</p>
								<p className="text-2xl font-bold text-gray-800">47</p>
							</div>
						</div>
					</Card>

					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg border border-pink-100">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
								<Heart className="w-6 h-6 text-pink-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Favorites</p>
								<p className="text-2xl font-bold text-gray-800">12</p>
							</div>
						</div>
					</Card>

					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg border border-blue-100">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
								<Users className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Style Friends</p>
								<p className="text-2xl font-bold text-gray-800">8</p>
							</div>
						</div>
					</Card>

					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg border border-green-100">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
								<TrendingUp className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Outfits Created</p>
								<p className="text-2xl font-bold text-gray-800">23</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Action Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* My Wardrobe */}
					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
								<Plus className="w-8 h-8 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-2">My Wardrobe</h3>
								<p className="text-gray-600 mb-4">
									View and organize your clothing items
								</p>
							</div>
							<Button
								className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
								onClick={() => navigate('/virtual-wardrobe')}
							>
								Open Wardrobe
							</Button>
						</div>
					</Card>

					{/* Virtual Avatar */}
					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto">
								<Users className="w-8 h-8 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-2">Virtual Avatar</h3>
								<p className="text-gray-600 mb-4">
									Customize your 3D avatar and try on outfits
								</p>
							</div>
							<Button
								className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
								onClick={() => navigate('/virtual-wardrobe')}
							>
								Create Avatar
							</Button>
						</div>
					</Card>

					{/* AI Recommendations */}
					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
								<Star className="w-8 h-8 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-2">AI Styling</h3>
								<p className="text-gray-600 mb-4">
									Get personalized outfit recommendations
								</p>
							</div>
							<Button
								className="w-full bg-gradient-to-r from-yellow-600 to-orange-600"
								onClick={() => navigate('/virtual-wardrobe')}
							>
								Get Styled
							</Button>
						</div>
					</Card>

					{/* Social Features */}
					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto">
								<Heart className="w-8 h-8 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-2">Style Community</h3>
								<p className="text-gray-600 mb-4">
									Share outfits and get inspired by others
								</p>
							</div>
							<Button
								className="w-full bg-gradient-to-r from-green-600 to-teal-600"
								onClick={() => navigate('/virtual-wardrobe')}
							>
								Explore Community
							</Button>
						</div>
					</Card>

					{/* Wardrobe Analytics */}
					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
								<TrendingUp className="w-8 h-8 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-2">Style Analytics</h3>
								<p className="text-gray-600 mb-4">
									Track your style trends and preferences
								</p>
							</div>
							<Button
								className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
								onClick={() => navigate('/virtual-wardrobe')}
							>
								View Analytics
							</Button>
						</div>
					</Card>

					{/* Quick Add */}
					<Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto">
								<Sparkles className="w-8 h-8 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-2">Quick Add</h3>
								<p className="text-gray-600 mb-4">
									Quickly add new items to your wardrobe
								</p>
							</div>
							<Button
								className="w-full bg-gradient-to-r from-pink-600 to-rose-600"
								onClick={() => navigate('/virtual-wardrobe')}
							>
								Add Items
							</Button>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
