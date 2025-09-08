import React from 'react'

const BackupStyleLanding: React.FC = () => {
	return (
		<div style={{
			minHeight: '100vh',
			backgroundColor: '#000000',
			color: '#ffffff',
			fontFamily: 'system-ui, -apple-system, sans-serif'
		}}>
			{/* Navigation Bar */}
			<nav style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '16px 24px',
				backgroundColor: '#000000',
				borderBottom: '1px solid rgba(168, 85, 247, 0.2)'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
					<div style={{
						width: '32px',
						height: '32px',
						background: 'linear-gradient(to right, #a855f7, #ec4899)',
						borderRadius: '8px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
						✨
					</div>
					<span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>Wardrobe AI</span>
					<span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '8px' }}>Powered by Sameer</span>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
					<a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Features</a>
					<a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Virtual Wardrobe</a>
					<a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Community</a>
					<a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>AI Styling</a>

					<button style={{
						backgroundColor: '#1f2937',
						color: '#ffffff',
						padding: '8px 16px',
						borderRadius: '24px',
						border: '1px solid #4b5563',
						cursor: 'pointer'
					}}>
						Virtual Wardrobe
					</button>
					<button style={{
						backgroundColor: '#ffffff',
						color: '#000000',
						padding: '8px 16px',
						borderRadius: '24px',
						border: 'none',
						cursor: 'pointer'
					}}>
						Logout
					</button>
				</div>
			</nav>

			{/* Main Content */}
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '48px 24px',
				minHeight: 'calc(100vh - 80px)'
			}}>
				{/* Left Side - Text Content */}
				<div style={{ flex: '1', maxWidth: '600px' }}>
					<h1 style={{
						fontSize: '6rem',
						fontWeight: 'bold',
						marginBottom: '24px',
						background: 'linear-gradient(to right, #c084fc, #f472b6, #a855f7)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						lineHeight: '1.1'
					}}>
						Wardrobe AI
					</h1>

					<p style={{
						fontSize: '24px',
						color: '#d1d5db',
						marginBottom: '32px',
						lineHeight: '1.5'
					}}>
						Your personal styling companion that turns your closet into endless possibilities
					</p>

					<p style={{
						fontSize: '18px',
						color: '#9ca3af',
						marginBottom: '40px',
						lineHeight: '1.5'
					}}>
						Create your virtual wardrobe, get AI-powered outfit recommendations, and share your style with friends. Never run out of outfit ideas again! ✨
					</p>

					<div style={{ display: 'flex', gap: '16px', marginBottom: '64px' }}>
						<button style={{
							background: 'linear-gradient(to right, #7c3aed, #ec4899)',
							color: '#ffffff',
							padding: '16px 32px',
							borderRadius: '12px',
							fontWeight: '600',
							border: 'none',
							cursor: 'pointer',
							fontSize: '16px'
						}}>
							✨ Start Building Your Wardrobe
						</button>

						<button style={{
							border: '2px solid #a855f7',
							color: '#a855f7',
							padding: '16px 32px',
							borderRadius: '12px',
							fontWeight: '600',
							backgroundColor: 'transparent',
							cursor: 'pointer',
							fontSize: '16px'
						}}>
							👥 Join Community
						</button>
					</div>

					{/* Statistics */}
					<div style={{ display: 'flex', gap: '48px' }}>
						<div style={{ textAlign: 'center' }}>
							<div style={{ fontSize: '36px', fontWeight: 'bold', color: '#a855f7', marginBottom: '8px' }}>10K+</div>
							<div style={{ color: '#9ca3af' }}>Outfits Created</div>
						</div>
						<div style={{ textAlign: 'center' }}>
							<div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ec4899', marginBottom: '8px' }}>5K+</div>
							<div style={{ color: '#9ca3af' }}>Style Twins Found</div>
						</div>
						<div style={{ textAlign: 'center' }}>
							<div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>98%</div>
							<div style={{ color: '#9ca3af' }}>Love Their Look</div>
						</div>
					</div>
				</div>

				{/* Right Side - 3D Wardrobe */}
				<div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<div style={{ position: 'relative' }}>
						{/* AI Styling Active Badge */}
						<div style={{
							position: 'absolute',
							top: '-24px',
							right: '32px',
							zIndex: 10
						}}>
							<div style={{
								background: 'linear-gradient(to right, #7c3aed, #ec4899)',
								color: '#ffffff',
								padding: '8px 16px',
								borderRadius: '24px',
								fontSize: '14px',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}>
								<div style={{
									width: '8px',
									height: '8px',
									backgroundColor: '#10b981',
									borderRadius: '50%',
									animation: 'pulse 2s infinite'
								}}></div>
								<div>
									<div style={{ fontWeight: '500' }}>AI Styling Active</div>
									<div style={{ fontSize: '12px', opacity: 0.9 }}>Real-time recommendations</div>
								</div>
							</div>
						</div>

						{/* 3D Wardrobe Container */}
						<div style={{
							width: '500px',
							height: '400px',
							background: 'linear-gradient(135deg, #fb7185, #ec4899, #a855f7)',
							borderRadius: '24px',
							padding: '32px',
							boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
						}}>
							{/* Wardrobe Interior */}
							<div style={{
								width: '100%',
								height: '100%',
								background: 'linear-gradient(to bottom, rgba(251, 113, 133, 0.8), rgba(236, 72, 153, 0.6), rgba(168, 85, 247, 0.8))',
								borderRadius: '16px',
								position: 'relative',
								overflow: 'hidden'
							}}>
								{/* Top Shelf with Handbags */}
								<div style={{
									position: 'absolute',
									top: '16px',
									left: '16px',
									right: '16px',
									height: '64px',
									background: 'linear-gradient(to right, rgba(254, 243, 199, 0.3), rgba(253, 186, 116, 0.3))',
									borderRadius: '8px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-around'
								}}>
									<div style={{ width: '32px', height: '24px', backgroundColor: '#92400e', borderRadius: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
									<div style={{ width: '32px', height: '24px', backgroundColor: '#000000', borderRadius: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
									<div style={{ width: '32px', height: '24px', backgroundColor: '#dc2626', borderRadius: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
									<div style={{ width: '32px', height: '24px', backgroundColor: '#2563eb', borderRadius: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
									<div style={{ width: '32px', height: '24px', backgroundColor: '#7c3aed', borderRadius: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
								</div>

								{/* Hanging Clothes Rail */}
								<div style={{
									position: 'absolute',
									top: '96px',
									left: '16px',
									right: '16px',
									height: '128px',
									display: 'flex',
									justifyContent: 'space-around',
									alignItems: 'flex-start'
								}}>
									{[
										{ color: '#3b82f6' },
										{ color: '#ef4444' },
										{ color: '#10b981' },
										{ color: '#8b5cf6' },
										{ color: '#f59e0b' }
									].map((item, index) => (
										<div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
											<div style={{ width: '4px', height: '32px', backgroundColor: '#4b5563' }}></div>
											<div style={{
												width: '24px',
												height: '80px',
												backgroundColor: item.color,
												borderRadius: '0 0 8px 8px',
												opacity: 0.9,
												boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
											}}></div>
										</div>
									))}
								</div>

								{/* Middle Shelf with Folded Clothes */}
								<div style={{
									position: 'absolute',
									bottom: '64px',
									left: '16px',
									right: '16px',
									display: 'grid',
									gridTemplateColumns: 'repeat(5, 1fr)',
									gap: '8px'
								}}>
									{['#4b5563', '#2563eb', '#dc2626', '#059669', '#7c3aed'].map((color, index) => (
										<div key={index} style={{
											height: '32px',
											backgroundColor: color,
											borderRadius: '4px',
											opacity: 0.7,
											boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
										}}></div>
									))}
								</div>

								{/* Bottom Shelf with Shoes */}
								<div style={{
									position: 'absolute',
									bottom: '16px',
									left: '16px',
									right: '16px',
									display: 'grid',
									gridTemplateColumns: 'repeat(5, 1fr)',
									gap: '8px'
								}}>
									{['#000000', '#92400e', '#dc2626', '#2563eb', '#ffffff'].map((color, index) => (
										<div key={index} style={{
											height: '24px',
											backgroundColor: color,
											borderRadius: '8px',
											opacity: 0.8,
											boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
										}}></div>
									))}
								</div>
							</div>
						</div>

						{/* Style Matches Badge */}
						<div style={{
							position: 'absolute',
							bottom: '-24px',
							left: '50%',
							transform: 'translateX(-50%)'
						}}>
							<div style={{
								backgroundColor: 'rgba(0, 0, 0, 0.7)',
								backdropFilter: 'blur(10px)',
								borderRadius: '24px',
								padding: '12px 24px',
								border: '1px solid rgba(168, 85, 247, 0.3)'
							}}>
								<div style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									color: '#ffffff'
								}}>
									<div style={{
										width: '8px',
										height: '8px',
										backgroundColor: '#f472b6',
										borderRadius: '50%'
									}}></div>
									<span style={{ fontWeight: 'bold', color: '#c084fc' }}>+127 Style Matches</span>
								</div>
								<div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>Perfect combinations found</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<style>
				{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
			</style>
		</div>
	)
}

{/* Right Side - 3D Wardrobe */ }
<div className="flex-1 flex justify-center items-center">
	<div className="relative">
		{/* AI Styling Active Badge */}
		<div className="absolute -top-6 right-8 z-10">
			<div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2">
				<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
				<div>
					<div className="font-medium">AI Styling Active</div>
					<div className="text-xs opacity-90">Real-time recommendations</div>
				</div>
			</div>
		</div>

		{/* 3D Wardrobe Container */}
		<div className="w-[500px] h-[400px] bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
			{/* Wardrobe Interior */}
			<div className="w-full h-full bg-gradient-to-b from-rose-300/80 via-pink-400/60 to-purple-500/80 rounded-2xl relative overflow-hidden">
				{/* Top Shelf with Handbags */}
				<div className="absolute top-4 left-4 right-4 h-16 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 rounded-lg flex items-center justify-around">
					<div className="w-8 h-6 bg-amber-800 rounded-sm shadow-md"></div>
					<div className="w-8 h-6 bg-black rounded-sm shadow-md"></div>
					<div className="w-8 h-6 bg-red-600 rounded-sm shadow-md"></div>
					<div className="w-8 h-6 bg-blue-600 rounded-sm shadow-md"></div>
					<div className="w-8 h-6 bg-purple-600 rounded-sm shadow-md"></div>
				</div>

				{/* Hanging Clothes Rail */}
				<div className="absolute top-24 left-4 right-4 h-32 flex justify-around items-start">
					{/* Individual Clothing Items */}
					<div className="flex flex-col items-center">
						<div className="w-1 h-8 bg-gray-600"></div>
						<div className="w-6 h-20 bg-blue-500 rounded-b-lg opacity-90 shadow-lg"></div>
					</div>
					<div className="flex flex-col items-center">
						<div className="w-1 h-8 bg-gray-600"></div>
						<div className="w-6 h-20 bg-red-500 rounded-b-lg opacity-90 shadow-lg"></div>
					</div>
					<div className="flex flex-col items-center">
						<div className="w-1 h-8 bg-gray-600"></div>
						<div className="w-6 h-20 bg-green-500 rounded-b-lg opacity-90 shadow-lg"></div>
					</div>
					<div className="flex flex-col items-center">
						<div className="w-1 h-8 bg-gray-600"></div>
						<div className="w-6 h-20 bg-purple-500 rounded-b-lg opacity-90 shadow-lg"></div>
					</div>
					<div className="flex flex-col items-center">
						<div className="w-1 h-8 bg-gray-600"></div>
						<div className="w-6 h-20 bg-yellow-500 rounded-b-lg opacity-90 shadow-lg"></div>
					</div>
				</div>

				{/* Middle Shelf with Folded Clothes */}
				<div className="absolute bottom-16 left-4 right-4 grid grid-cols-5 gap-2">
					<div className="h-8 bg-gray-600 rounded opacity-70 shadow-md"></div>
					<div className="h-8 bg-blue-600 rounded opacity-70 shadow-md"></div>
					<div className="h-8 bg-red-600 rounded opacity-70 shadow-md"></div>
					<div className="h-8 bg-green-600 rounded opacity-70 shadow-md"></div>
					<div className="h-8 bg-purple-600 rounded opacity-70 shadow-md"></div>
				</div>

				{/* Bottom Shelf with Shoes */}
				<div className="absolute bottom-4 left-4 right-4 grid grid-cols-5 gap-2">
					<div className="h-6 bg-black rounded-lg opacity-80 shadow-md"></div>
					<div className="h-6 bg-amber-700 rounded-lg opacity-80 shadow-md"></div>
					<div className="h-6 bg-red-600 rounded-lg opacity-80 shadow-md"></div>
					<div className="h-6 bg-blue-600 rounded-lg opacity-80 shadow-md"></div>
					<div className="h-6 bg-white rounded-lg opacity-80 shadow-md"></div>
				</div>
			</div>
		</div>

		{/* Style Matches Badge */}
		<div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
			<div className="bg-black/70 backdrop-blur rounded-full px-6 py-3 border border-purple-400/30">
				<div className="flex items-center space-x-2 text-white">
					<div className="w-2 h-2 bg-pink-400 rounded-full"></div>
					<span className="font-bold text-purple-300">+127 Style Matches</span>
				</div>
				<div className="text-xs text-gray-400 text-center">Perfect combinations found</div>
			</div>
		</div>
	</div>
</div>
      </div >
    </div >
  )
}

export default BackupStyleLanding
