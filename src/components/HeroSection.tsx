import heroImage from "@/assets/hero-wardrobe.jpg";
import { Button } from "@/components/ui/Button";
import { Award, Heart, Sparkles, Star, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
	const navigate = useNavigate();
	// const { user } = useAuth();

	const handleGetStarted = () => {
		// Temporarily disabled authentication for testing
		// if (user) {
		//   navigate('/dashboard');
		// } else {
		//   navigate('/login');
		// }

		// Direct navigation to Virtual Wardrobe for testing
		navigate('/virtual-wardrobe');
	};

	const handleJoinCommunity = () => {
		// Temporarily disabled authentication for testing
		// if (user) {
		//   navigate('/dashboard');
		// } else {
		//   navigate('/login');
		// }

		// Direct navigation to Virtual Wardrobe for testing
		navigate('/virtual-wardrobe');
	};

	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Enhanced background with multiple gradient layers */}
			<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
			<div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 via-transparent to-rose-100/30" />
			<div className="absolute inset-0 bg-gradient-to-bl from-violet-100/20 via-transparent to-cyan-100/20" />

			{/* Animated background patterns */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
			</div>

			{/* Enhanced floating elements with better animations */}
			<div className="absolute top-20 left-10 animate-float">
				<div className="relative">
					<Star className="w-10 h-10 text-purple-500/80 drop-shadow-lg" />
					<div className="absolute inset-0 w-10 h-10 bg-purple-400/20 rounded-full animate-ping" />
				</div>
			</div>

			<div className="absolute top-32 right-20 animate-float" style={{ animationDelay: '1s' }}>
				<div className="relative">
					<Heart className="w-8 h-8 text-pink-500/80 drop-shadow-lg" />
					<div className="absolute inset-0 w-8 h-8 bg-pink-400/20 rounded-full animate-ping" />
				</div>
			</div>

			<div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
				<div className="relative">
					<Zap className="w-9 h-9 text-yellow-500/80 drop-shadow-lg" />
					<div className="absolute inset-0 w-9 h-9 bg-yellow-400/20 rounded-full animate-ping" />
				</div>
			</div>

			{/* Main content - TWO COLUMN LAYOUT */}
			<div className="container mx-auto px-4 relative z-10">
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					{/* Enhanced left content with better typography and spacing */}
					<div className="text-center lg:text-left space-y-10">
						<div className="space-y-6">
							{/* Enhanced main title with multiple gradient layers */}
							<div className="relative">
								<h1 className="text-6xl lg:text-8xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight tracking-tight">
									Wardrobe AI
								</h1>
								{/* Glow effect behind the title */}
								<div className="absolute inset-0 text-6xl lg:text-8xl font-black text-purple-600/20 blur-xl -z-10">
									🚀 NEW DESIGN LOADED 🚀 Wardrobe AI
								</div>
							</div>

							{/* Enhanced tagline with better colors */}
							<p className="text-2xl lg:text-3xl font-semibold text-gray-800 max-w-lg leading-relaxed">
								Your personal styling companion that turns your closet into endless possibilities
							</p>
						</div>

						<div className="space-y-8">
							{/* Enhanced description with better styling */}
							<p className="text-lg lg:text-xl text-gray-700 max-w-2xl leading-relaxed">
								Create your virtual wardrobe, get AI-powered outfit recommendations, and share your style with friends.
								Never run out of outfit ideas again!
								<span className="inline-block ml-2 text-2xl animate-bounce">✨</span>
							</p>

							{/* Enhanced CTA buttons with better styling */}
							<div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
								<Button
									variant="primary"
									size="lg"
									className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
									onClick={handleGetStarted}
								>
									<Sparkles className="w-6 h-6 mr-2" />
									Start Building Your Wardrobe
								</Button>

								<Button
									variant="outline"
									size="lg"
									className="text-lg px-10 py-6 h-auto bg-white/90 backdrop-blur-sm border-2 border-purple-200 text-purple-700 hover:bg-white hover:border-purple-300 hover:text-purple-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
									onClick={handleJoinCommunity}
								>
									<Users className="w-6 h-6 mr-2" />
									Join Community
								</Button>
							</div>
						</div>

						{/* Enhanced stats with better visual design */}
						<div className="grid grid-cols-3 gap-8 pt-12">
							<div className="text-center group">
								<div className="relative">
									<div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
										10K+
									</div>
									<div className="absolute inset-0 text-3xl lg:text-4xl font-black text-purple-600/20 blur-sm -z-10">
										10K+
									</div>
								</div>
								<div className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
									Outfits Created
								</div>
								<div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>

							<div className="text-center group">
								<div className="relative">
									<div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
										5K+
									</div>
									<div className="absolute inset-0 text-3xl lg:text-4xl font-black text-pink-600/20 blur-sm -z-10">
										5K+
									</div>
								</div>
								<div className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
									Style Twins Found
								</div>
								<div className="w-8 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>

							<div className="text-center group">
								<div className="relative">
									<div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
										98%
									</div>
									<div className="absolute inset-0 text-3xl lg:text-4xl font-black text-blue-600/20 blur-sm -z-10">
										98%
									</div>
								</div>
								<div className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
									Love Their Look
								</div>
								<div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
						</div>
					</div>

					{/* Enhanced right image section */}
					<div className="relative">
						<div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
							<img
								src={heroImage}
								alt="Modern stylish wardrobe with colorful hanging clothes"
								className="w-full h-[600px] object-cover"
							/>
							{/* Enhanced overlay gradients */}
							<div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent" />
							<div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-pink-900/20" />
						</div>

						{/* Enhanced floating cards with better styling */}
						<div className="absolute -top-8 -right-8 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-float border border-purple-100">
							<div className="flex items-center gap-3">
								<div className="relative">
									<div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
									<div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping" />
								</div>
								<div>
									<div className="text-sm font-semibold text-gray-800">AI Styling Active</div>
									<div className="text-xs text-gray-500">Real-time recommendations</div>
								</div>
							</div>
						</div>

						<div className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-float border border-rose-100" style={{ animationDelay: '1.5s' }}>
							<div className="flex items-center gap-3">
								<div className="relative">
									<Heart className="w-5 h-5 text-rose-500" />
									<div className="absolute inset-0 w-5 h-5 bg-rose-400/20 rounded-full animate-ping" />
								</div>
								<div>
									<div className="text-sm font-semibold text-gray-800">+127 Style Matches</div>
									<div className="text-xs text-gray-500">Perfect combinations found</div>
								</div>
							</div>
						</div>

						{/* Additional floating element */}
						<div className="absolute top-1/2 -right-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-3 shadow-lg animate-float" style={{ animationDelay: '3s' }}>
							<Award className="w-6 h-6 text-white" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
