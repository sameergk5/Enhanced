import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Camera, Heart, Plus, Sparkles } from "lucide-react";

const SimpleVirtualWardrobe = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
			{/* Header */}
			<header className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
							Virtual Wardrobe
						</h1>
					</div>
					<Button variant="outline">Back to Home</Button>
				</div>
			</header>

			<div className="max-w-7xl mx-auto p-6">
				{/* Hero Section */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
						Your Virtual Wardrobe
					</h1>
					<p className="text-xl text-gray-600 mb-8">
						Manage your closet digitally and get AI-powered styling suggestions
					</p>

					<div className="flex justify-center gap-4">
						<Button variant="primary" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
							<Plus className="w-5 h-5 mr-2" />
							Add New Item
						</Button>
						<Button variant="secondary" size="lg">
							<Camera className="w-5 h-5 mr-2" />
							Upload Photos
						</Button>
					</div>
				</div>

				{/* Wardrobe Gallery */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold text-gray-800">Your Items</h2>
						<div className="flex gap-2">
							<Badge variant="secondary">127 items</Badge>
							<Badge variant="secondary">12 categories</Badge>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{[...Array(12)].map((_, i) => (
							<Card key={i} className="group overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
								<div className="relative">
									<div className="h-32 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
										<span className="text-gray-600 text-sm">Item {i + 1}</span>
									</div>
									<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button variant="secondary" size="sm" className="w-8 h-8 p-0 bg-white/80">
											<Heart className="w-4 h-4" />
										</Button>
									</div>
								</div>
								<div className="p-3">
									<h3 className="font-medium text-gray-800 text-sm">Casual Shirt</h3>
									<p className="text-xs text-gray-600">Blue</p>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* AI Styling Section */}
				<Card className="p-8 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white">
					<div className="text-center">
						<Sparkles className="w-12 h-12 mx-auto mb-4" />
						<h2 className="text-3xl font-bold mb-4">AI Styling Active</h2>
						<p className="text-xl mb-6">
							Get personalized outfit recommendations based on your wardrobe
						</p>
						<div className="grid md:grid-cols-3 gap-6 text-center">
							<div>
								<div className="text-3xl font-bold">+127</div>
								<div className="text-sm opacity-90">Style Matches Found</div>
							</div>
							<div>
								<div className="text-3xl font-bold">98%</div>
								<div className="text-sm opacity-90">Accuracy Rate</div>
							</div>
							<div>
								<div className="text-3xl font-bold">24/7</div>
								<div className="text-sm opacity-90">Real-time Recommendations</div>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default SimpleVirtualWardrobe;
