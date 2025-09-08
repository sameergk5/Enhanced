import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import SocialSection from "@/components/SocialSection";
import WardrobePreview from "@/components/WardrobePreview";

const Index = () => {
	return (
		<div className="min-h-screen">
			<Navigation />
			<main>
				<HeroSection />
				<FeaturesSection />
				<WardrobePreview />
				<SocialSection />
			</main>
			<Footer />
		</div>
	);
};

export default Index;
