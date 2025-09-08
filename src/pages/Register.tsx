import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Register = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md p-8 bg-white shadow-xl">
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
							Wardrobe AI
						</h1>
					</div>
					<h2 className="text-xl font-semibold text-gray-800">Create Account</h2>
					<p className="text-gray-600">Join thousands of style enthusiasts</p>
				</div>

				<form className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
						<Input type="text" placeholder="Enter your full name" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
						<Input type="email" placeholder="Enter your email" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
						<Input type="password" placeholder="Create a password" />
					</div>
					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
						onClick={(e) => {
							e.preventDefault();
							navigate('/dashboard');
						}}
					>
						Create Account
					</Button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-gray-600">
						Already have an account?{" "}
						<button
							className="text-purple-600 hover:underline"
							onClick={() => navigate('/login')}
						>
							Sign in
						</button>
					</p>
				</div>
			</Card>
		</div>
	);
};

export default Register;
