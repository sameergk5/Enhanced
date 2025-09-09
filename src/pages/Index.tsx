import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SocialSection from "@/components/SocialSection";
import WardrobePreview from "@/components/WardrobePreview";

const Index = () => {
	return (
		<div className="min-h-screen">
			<Header />
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
