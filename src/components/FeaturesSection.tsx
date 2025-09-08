import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
	Camera,
	Heart,
	Lightbulb,
	MessageCircle,
	Share2,
	Sparkles,
	Users,
	Zap
} from "lucide-react";

const FeaturesSection = () => {
	const features = [
		{
			icon: Camera,
			title: "Virtual Wardrobe",
			description: "Upload and organize your entire closet digitally. Add photos, tags, and details for every piece.",
			color: "from-purple-500 to-purple-600"
		},
		{
			icon: Sparkles,
			title: "AI Styling",
			description: "Get personalized outfit recommendations based on weather, occasion, and your style preferences.",
			color: "from-pink-500 to-pink-600"
		},
		{
			icon: Users,
			title: "Style Community",
			description: "Share your wardrobe with friends, find style twins, and discover new fashion inspiration.",
			color: "from-blue-500 to-blue-600"
		},
		{
			icon: Heart,
			title: "Borrow & Share",
			description: "Love a friend's outfit? Borrow items from their virtual wardrobe or lend yours to others.",
			color: "from-pink-500 to-rose-500"
		},
		{
			icon: MessageCircle,
			title: "Style Feedback",
			description: "Get votes and opinions from your fashion circle. Rate outfits and build style streaks.",
			color: "from-indigo-500 to-purple-500"
		},
		{
			icon: Lightbulb,
			title: "Smart Suggestions",
			description: "AI analyzes trends, weather, and occasions to suggest the perfect outfit combinations.",
			color: "from-yellow-500 to-orange-500"
		}
	];

	return (
		<section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
			<div className="container mx-auto">
				{/* Header */}
				<div className="text-center mb-16 space-y-4">
					<h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
						Fashion Magic at Your Fingertips
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Transform how you dress with AI-powered styling, social features, and endless outfit possibilities
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
					{features.map((feature, index) => (
						<Card key={index} className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 group border-0">
							<div className="space-y-4">
								<div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${feature.color} p-3 flex items-center justify-center group-hover:scale-110 transition-all duration-300`}>
									<feature.icon className="w-6 h-6 text-white" />
								</div>

								<div className="space-y-2">
									<h3 className="text-xl font-semibold text-gray-800">
										{feature.title}
									</h3>
									<p className="text-gray-600 leading-relaxed">
										{feature.description}
									</p>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Social Features Highlight */}
				<div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 lg:p-12 text-center shadow-2xl">
					<div className="max-w-4xl mx-auto space-y-6">
						<div className="flex justify-center gap-4 mb-6">
							<Share2 className="w-8 h-8 text-white/80 animate-bounce" />
							<Heart className="w-8 h-8 text-white/80 animate-bounce" style={{ animationDelay: '0.5s' }} />
							<Users className="w-8 h-8 text-white/80 animate-bounce" style={{ animationDelay: '1s' }} />
						</div>

						<h3 className="text-3xl lg:text-4xl font-bold text-white">
							Fashion is Better Together
						</h3>

						<p className="text-xl text-white/90 max-w-2xl mx-auto">
							Connect with friends, share your style, and build a fashion community.
							From style streaks to outfit votes - make fashion social and fun!
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<Button variant="secondary" size="lg" className="text-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
								<Zap className="w-5 h-5 mr-2" />
								Explore Social Features
							</Button>
							<Button variant="outline" size="lg" className="text-lg border-white/30 text-white hover:bg-white/10">
								Find Your Style Twin
								<Users className="w-5 h-5 ml-2" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default FeaturesSection;
