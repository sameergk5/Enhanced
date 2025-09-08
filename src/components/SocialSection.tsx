import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
	Flame,
	Heart,
	MessageCircle,
	Share2,
	Star,
	TrendingUp,
	Trophy,
	Users
} from "lucide-react";

const SocialSection = () => {
	const styleInfluencers = [
		{
			name: "Rakshita",
			avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face",
			followers: "12.5K",
			streak: 15,
			style: "Minimalist Chic",
			rating: 4.9
		},
		{
			name: "Priya",
			avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
			followers: "8.2K",
			streak: 23,
			style: "Boho Elegant",
			rating: 4.8
		},
		{
			name: "Sameer",
			avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
			followers: "15.1K",
			streak: 31,
			style: "Street Fashion",
			rating: 4.9
		}
	];

	const trendingOutfits = [
		{
			user: "Rakshita",
			outfit: "Silk Blazer + Wide Leg Pants",
			likes: 247,
			comments: 34,
			shares: 18,
			occasion: "Work Meeting",
			image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=200&fit=crop"
		},
		{
			user: "Priya",
			outfit: "Maxi Dress + Statement Jewelry",
			likes: 189,
			comments: 28,
			shares: 15,
			occasion: "Brunch Date",
			image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=200&fit=crop"
		}
	];

	return (
		<section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
			<div className="container mx-auto">
				{/* Header */}
				<div className="text-center mb-16 space-y-4">
					<h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
						Fashion Community
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Connect with style enthusiasts, share your looks, and discover fashion inspiration from around the world
					</p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Style Influencers */}
					<div className="space-y-6">
						<div className="flex items-center gap-2">
							<Trophy className="w-6 h-6 text-purple-600" />
							<h3 className="text-xl font-semibold">Top Style Influencers</h3>
						</div>

						<div className="space-y-4">
							{styleInfluencers.map((influencer, index) => (
								<Card key={index} className="p-4 bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 group">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
											{influencer.name[0]}
										</div>

										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-semibold text-gray-800">{influencer.name}</h4>
												<div className="flex items-center gap-1">
													<Flame className="w-3 h-3 text-orange-500" />
													<span className="text-xs text-orange-500 font-medium">{influencer.streak}</span>
												</div>
											</div>

											<p className="text-sm text-gray-600 mb-2">{influencer.style}</p>

											<div className="flex items-center gap-3 text-xs text-gray-500">
												<div className="flex items-center gap-1">
													<Users className="w-3 h-3" />
													<span>{influencer.followers}</span>
												</div>
												<div className="flex items-center gap-1">
													<Star className="w-3 h-3" />
													<span>{influencer.rating}</span>
												</div>
											</div>
										</div>

										<Button variant="outline" size="sm">Follow</Button>
									</div>
								</Card>
							))}
						</div>
					</div>

					{/* Trending Outfits */}
					<div className="lg:col-span-2 space-y-6">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-6 h-6 text-pink-600" />
							<h3 className="text-xl font-semibold">Trending Outfits</h3>
						</div>

						<div className="space-y-6">
							{trendingOutfits.map((outfit, index) => (
								<Card key={index} className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
									<div className="grid md:grid-cols-3 gap-6">
										<div className="relative">
											<img
												src={outfit.image}
												alt={outfit.outfit}
												className="w-full h-48 md:h-full object-cover"
											/>
											<Badge variant="secondary" className="absolute top-2 left-2">
												{outfit.occasion}
											</Badge>
										</div>

										<div className="md:col-span-2 p-6 space-y-4">
											<div>
												<div className="flex items-center gap-2 mb-2">
													<div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
														{outfit.user[0]}
													</div>
													<span className="font-medium text-gray-800">{outfit.user}</span>
												</div>
												<h4 className="text-lg font-semibold text-gray-800 mb-2">{outfit.outfit}</h4>
												<p className="text-gray-600">Perfect for {outfit.occasion.toLowerCase()}</p>
											</div>

											<div className="flex items-center gap-6 text-sm text-gray-500">
												<div className="flex items-center gap-2">
													<Heart className="w-4 h-4" />
													<span>{outfit.likes}</span>
												</div>
												<div className="flex items-center gap-2">
													<MessageCircle className="w-4 h-4" />
													<span>{outfit.comments}</span>
												</div>
												<div className="flex items-center gap-2">
													<Share2 className="w-4 h-4" />
													<span>{outfit.shares}</span>
												</div>
											</div>

											<div className="flex gap-2">
												<Button variant="primary" size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500">
													<Heart className="w-4 h-4 mr-2" />
													Love it
												</Button>
												<Button variant="outline" size="sm">
													<Share2 className="w-4 h-4 mr-2" />
													Share
												</Button>
											</div>
										</div>
									</div>
								</Card>
							))}
						</div>

						{/* Community Stats */}
						<Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
							<div className="text-center space-y-4">
								<h4 className="text-xl font-semibold text-gray-800">Join Our Growing Community</h4>
								<div className="grid grid-cols-3 gap-6">
									<div>
										<div className="text-2xl font-bold text-purple-600">50K+</div>
										<div className="text-sm text-gray-600">Active Members</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-pink-600">200K+</div>
										<div className="text-sm text-gray-600">Outfits Shared</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-blue-600">98%</div>
										<div className="text-sm text-gray-600">Style Satisfaction</div>
									</div>
								</div>
								<Button variant="primary" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
									<Users className="w-5 h-5 mr-2" />
									Join Community
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
};

export default SocialSection;
