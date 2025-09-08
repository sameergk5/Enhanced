import { Button } from "@/components/ui/Button";
import {
	Facebook,
	Heart,
	Instagram,
	Mail,
	MapPin,
	Sparkles,
	Twitter
} from "lucide-react";

const Footer = () => {
	return (
		<footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
			<div className="container mx-auto px-4 py-16">
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-white" />
							</div>
							<span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
								Wardrobe AI
							</span>
						</div>
						<p className="text-gray-600 max-w-sm">
							Your personal styling companion that transforms your closet into endless possibilities with AI-powered recommendations.
						</p>
						<div className="flex gap-3">
							<Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-purple-100">
								<Instagram className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-purple-100">
								<Twitter className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-purple-100">
								<Facebook className="w-4 h-4" />
							</Button>
						</div>
					</div>

					{/* Product */}
					<div className="space-y-4">
						<h3 className="font-semibold text-gray-800">Product</h3>
						<div className="space-y-2">
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Virtual Wardrobe
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								AI Styling
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Style Community
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Outfit Recommendations
							</a>
						</div>
					</div>

					{/* Company */}
					<div className="space-y-4">
						<h3 className="font-semibold text-gray-800">Company</h3>
						<div className="space-y-2">
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								About Us
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Careers
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Press
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Blog
							</a>
						</div>
					</div>

					{/* Support */}
					<div className="space-y-4">
						<h3 className="font-semibold text-gray-800">Support</h3>
						<div className="space-y-2">
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Help Center
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Privacy Policy
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Terms of Service
							</a>
							<a href="#" className="block text-gray-600 hover:text-purple-600 transition-colors">
								Contact Us
							</a>
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Mail className="w-4 h-4" />
							hello@wardrobeai.com
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<MapPin className="w-4 h-4" />
							San Francisco, CA
						</div>
					</div>
				</div>

				{/* Bottom */}
				<div className="border-t border-gray-200 mt-12 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<span>Made with</span>
							<Heart className="w-4 h-4 text-red-500" />
							<span>by Sameer</span>
						</div>

						<div className="text-sm text-gray-600">
							© 2024 Wardrobe AI. All rights reserved.
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
