import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md p-8 bg-white shadow-xl text-center">
				<div className="mb-6">
					<AlertCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
					<h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
					<h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
					<p className="text-gray-600">
						Looks like this page got lost in the wardrobe! Let's get you back to styling.
					</p>
				</div>

				<div className="space-y-4">
					<Button
						variant="primary"
						className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
						onClick={() => navigate('/')}
					>
						<Home className="w-4 h-4 mr-2" />
						Back to Home
					</Button>

					<Button
						variant="outline"
						className="w-full"
						onClick={() => navigate('/dashboard')}
					>
						Go to Dashboard
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default NotFound;
