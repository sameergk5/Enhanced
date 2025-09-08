import React from 'react'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection_new'
import Navigation from '../components/Navigation_new'
import StatsSection from '../components/StatsSection'

const LandingSimple: React.FC = () => {
	return (
		<div className="min-h-screen">
			<Navigation />
			<HeroSection />
			<StatsSection />
			<Footer />
		</div>
	)
}

export default LandingSimple
