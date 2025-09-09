import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import SimpleVirtualWardrobe from './pages/SimpleVirtualWardrobe';
import VirtualWardrobeCategories from './pages/VirtualWardrobeCategories';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Index />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/virtual-wardrobe" element={<VirtualWardrobeCategories />} />
				<Route path="/virtual-wardrobe/items" element={<SimpleVirtualWardrobe />} />
				<Route path="/virtual-wardrobe-simple" element={<SimpleVirtualWardrobe />} />
				<Route path="/community" element={<Community />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
}

export default App;
