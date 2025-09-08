import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Heart, Plus, Share2, Sparkles } from "lucide-react";

const WardrobePreview = () => {
	const sampleClothes = [
		{
			id: 1,
			name: "Silk Blouse",
			category: "Tops",
			color: "Blush Pink",
			image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=400&fit=crop",
			likes: 23,
			occasions: ["Work", "Date Night"]
		},
		{
			id: 2,
			name: "High-Waist Jeans",
			category: "Bottoms",
			color: "Dark Wash",
			image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop",
			likes: 18,
			occasions: ["Casual", "Weekend"]
		},
		{
			id: 3,
			name: "Midi Dress",
			category: "Dresses",
			color: "Emerald",
			image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop",
			likes: 31,
			occasions: ["Party", "Dinner"]
		},
		{
			id: 4,
			name: "Blazer",
			category: "Outerwear",
			color: "Navy",
			image: "https://images.unsplash.com/photo-1591369823096-3d60d68e3c8f?w=300&h=400&fit=crop",
			likes: 27,
			occasions: ["Work", "Formal"]
		}
	];

	const aiSuggestions = [
		{
			occasion: "Work Meeting",
			items: ["Silk Blouse", "Navy Blazer", "High-Waist Jeans"],
			confidence: 95,
			weather: "Sunny, 72°F"
		},
		{
			occasion: "Date Night",
			items: ["Emerald Midi Dress", "Statement Earrings"],
			confidence: 92,
			weather: "Clear, 68°F"
		}
	];

	return (
		<section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
			<div className="container mx-auto">
				{/* Header */}
				<div className="text-center mb-16 space-y-4">
					<h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
						Your Digital Closet
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Organize, style, and share your wardrobe like never before
					</p>
				</div>

				<div className="grid lg:grid-cols-2 gap-12 items-start">
					{/* Virtual Wardrobe */}
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h3 className="text-2xl font-semibold">My Wardrobe</h3>
							<Button variant="primary" size="sm">
								<Plus className="w-4 h-4 mr-2" />
								Add Item
							</Button>
						</div>

						<div className="grid grid-cols-2 gap-4">
							{sampleClothes.map((item) => (
								<Card key={item.id} className="group overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
									<div className="relative">
										<img
											src={item.image}
											alt={item.name}
											className="w-full h-48 object-cover group-hover:scale-105 transition-all duration-300"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

										{/* Floating actions */}
										<div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
											<Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/20 backdrop-blur-sm">
												<Heart className="w-4 h-4" />
											</Button>
											<Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/20 backdrop-blur-sm">
												<Share2 className="w-4 h-4" />
											</Button>
										</div>

										{/* Item info overlay */}
										<div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
											<div className="flex items-center gap-2">
												<Heart className="w-4 h-4" />
												<span className="text-sm">{item.likes}</span>
											</div>
										</div>
									</div>

									<div className="p-4 space-y-3">
										<div>
											<h4 className="font-semibold text-gray-800">{item.name}</h4>
											<p className="text-sm text-gray-600">{item.color}</p>
										</div>

										<div className="flex flex-wrap gap-1">
											{item.occasions.map((occasion, idx) => (
												<Badge key={idx} variant="secondary" className="text-xs">
													{occasion}
												</Badge>
											))}
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>

					{/* AI Suggestions */}
					<div className="space-y-6">
						<div className="flex items-center gap-2">
							<Sparkles className="w-6 h-6 text-purple-600" />
							<h3 className="text-2xl font-semibold">AI Styling Suggestions</h3>
						</div>

						<div className="space-y-4">
							{aiSuggestions.map((suggestion, index) => (
								<Card key={index} className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<h4 className="font-semibold text-gray-800">{suggestion.occasion}</h4>
											<Badge variant="success" className="bg-green-100 text-green-800">
												{suggestion.confidence}% match
											</Badge>
										</div>

										<div className="space-y-2">
											<p className="text-sm text-gray-600">Perfect for {suggestion.weather}</p>
											<div className="flex flex-wrap gap-2">
												{suggestion.items.map((item, idx) => (
													<Badge key={idx} variant="outline" className="border-purple-200 text-purple-700">
														{item}
													</Badge>
												))}
											</div>
										</div>

										<Button variant="primary" size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
											<Sparkles className="w-4 h-4 mr-2" />
											Try This Outfit
										</Button>
									</div>
								</Card>
							))}
						</div>

						<Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
							<div className="text-center space-y-4">
								<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
									<Sparkles className="w-6 h-6 text-white" />
								</div>
								<h4 className="font-semibold text-gray-800">Want More Suggestions?</h4>
								<p className="text-sm text-gray-600">
									Upload more items to get personalized AI recommendations
								</p>
								<Button variant="primary" size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500">
									Upload Photos
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
};

export default WardrobePreview;
