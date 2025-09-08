import { Plus, Shirt } from 'lucide-react'
import { useState } from 'react'
import { GarmentDetailModal } from '../components/wardrobe/GarmentDetailModal'
import GarmentUpload from '../components/wardrobe/GarmentUpload'
import WardrobeGrid from '../components/wardrobe/WardrobeGrid'
import { type Garment } from '../services/wardrobe'

const WardrobePage = () => {
	const [currentView, setCurrentView] = useState<'grid' | 'upload' | 'edit'>('grid')
	const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null)
	const [editingGarment, setEditingGarment] = useState<Garment | null>(null)
	const [showDetailModal, setShowDetailModal] = useState(false)

	const handleAddGarment = () => {
		setCurrentView('upload')
		setEditingGarment(null)
	}

	// WardrobeGrid supplies a simplified garment shape; treat as partial Garment
	const handleEditGarment = (garment: any) => {
		setEditingGarment(garment as Garment)
		setCurrentView('edit')
	}

	const handleViewGarment = (garment: any) => {
		setSelectedGarment(garment as Garment)
		setShowDetailModal(true)
	}

	const handleGarmentUploadComplete = () => {
		setCurrentView('grid')
		setEditingGarment(null)
		// Trigger refresh of the grid component
		window.location.reload()
	}

	const handleBackToGrid = () => {
		setCurrentView('grid')
		setEditingGarment(null)
	}

	const handleDeleteGarment = async (garmentId: string) => {
		try {
			const response = await fetch(`/api/garments/${garmentId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			})

			const data = await response.json()
			if (data.success) {
				setShowDetailModal(false)
				setSelectedGarment(null)
				// Trigger refresh of the grid component
				window.location.reload()
			}
		} catch (err) {
			console.error('Delete garment error:', err)
		}
	}

	return (
		<div className="min-h-screen bg-surface">
			{/* Header */}
			<div className="bg-surface elevation-1 border-b" style={{ borderColor: 'var(--color-surface-variant)' }}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-6">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<Shirt className="w-8 h-8 text-primary" />
								<h1 className="text-3xl font-bold text-primary">My Wardrobe</h1>
							</div>

							{currentView !== 'grid' && (
								<button
									onClick={handleBackToGrid}
									className="font-medium text-primary hover:underline transition-theme"
								>
									← Back to Wardrobe
								</button>
							)}
						</div>

						{currentView === 'grid' && (
							<button
								onClick={handleAddGarment}
								className="px-6 py-2 btn-primary rounded-lg flex items-center space-x-2"
							>
								<Plus className="w-5 h-5" />
								<span>Add Garment</span>
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{currentView === 'grid' && (
					<WardrobeGrid
						onAddGarment={handleAddGarment}
						onEditGarment={handleEditGarment}
						onViewGarment={handleViewGarment}
					/>
				)}

				{(currentView === 'upload' || currentView === 'edit') && (
					<div className="max-w-4xl mx-auto">
						<div className="bg-surface rounded-lg elevation-1 border transition-theme" style={{ borderColor: 'var(--color-surface-variant)' }}>
							<div className="p-6 border-b" style={{ borderColor: 'var(--color-surface-variant)' }}>
								<h2 className="text-2xl font-bold text-primary">
									{currentView === 'edit' ? 'Edit Garment' : 'Add New Garment'}
								</h2>
								<p className="text-secondary mt-1">
									{currentView === 'edit'
										? 'Update your garment details and metadata'
										: 'Upload a photo and add details about your new garment'
									}
								</p>
							</div>
							<div className="p-6">
								<GarmentUpload
									existingGarment={editingGarment}
									onComplete={handleGarmentUploadComplete}
									onCancel={handleBackToGrid}
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Garment Detail Modal */}
			{showDetailModal && (
				<GarmentDetailModal
					garment={selectedGarment}
					isOpen={showDetailModal}
					onClose={() => {
						setShowDetailModal(false)
						setSelectedGarment(null)
					}}
					onDelete={handleDeleteGarment}
				/>
			)}
		</div>
	)
}

export default WardrobePage
