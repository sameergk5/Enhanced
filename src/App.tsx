import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
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
				{/* New category landing page */}
				<Route path="/virtual-wardrobe" element={<VirtualWardrobeCategories />} />
				{/* Items (previous simple wardrobe) view */}
				<Route path="/virtual-wardrobe/items" element={<SimpleVirtualWardrobe />} />
				<Route path="/virtual-wardrobe-simple" element={<SimpleVirtualWardrobe />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
}

export default App;
