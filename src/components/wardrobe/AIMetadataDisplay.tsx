import { AlertCircle, Brain, Check, CheckCircle, Edit3, RefreshCw, X } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from '../ui/Badge'

interface AIMetadata {
	category?: string
	subcategory?: string
	color?: string
	pattern?: string
	material?: string
	brand?: string
	style?: string
	confidence?: number
	aiStatus?: 'pending' | 'processing' | 'completed' | 'failed'
	lastAnalyzed?: string
	errorMessage?: string
}

interface AIMetadataDisplayProps {
	metadata: AIMetadata
	isEditing?: boolean
	onEdit?: () => void
	onSave?: (updatedMetadata: Partial<AIMetadata>) => void
	onCancel?: () => void
	onReanalyze?: () => void
	isReanalyzing?: boolean
}

export const AIMetadataDisplay: React.FC<AIMetadataDisplayProps> = ({
	metadata,
	isEditing = false,
	onEdit,
	onSave,
	onCancel,
	onReanalyze,
	isReanalyzing = false
}) => {
	const [editedData, setEditedData] = useState<Partial<AIMetadata>>(metadata)

	const getStatusBadge = () => {
		switch (metadata.aiStatus) {
			case 'pending':
				return <Badge variant="warning" className="flex items-center gap-1">
					<AlertCircle size={12} />
					Analysis Pending
				</Badge>
			case 'processing':
				return <Badge variant="info" className="flex items-center gap-1">
					<RefreshCw size={12} className="animate-spin" />
					Processing...
				</Badge>
			case 'completed':
				return <Badge variant="success" className="flex items-center gap-1">
					<CheckCircle size={12} />
					Analysis Complete
				</Badge>
			case 'failed':
				return <Badge variant="error" className="flex items-center gap-1">
					<AlertCircle size={12} />
					Analysis Failed
				</Badge>
			default:
				return null
		}
	}

	const handleSave = () => {
		if (onSave) {
			onSave(editedData)
		}
	}

	const handleCancel = () => {
		setEditedData(metadata)
		if (onCancel) {
			onCancel()
		}
	}

	const updateField = (field: keyof AIMetadata, value: string) => {
		setEditedData(prev => ({ ...prev, [field]: value }))
	}

	const renderField = (label: string, field: keyof AIMetadata, value: string | undefined) => {
		if (isEditing) {
			return (
				<div className="space-y-1">
					<label className="text-sm font-medium text-gray-700">{label}</label>
					<input
						type="text"
						value={editedData[field] as string || ''}
						onChange={(e) => updateField(field, e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder={`Enter ${label.toLowerCase()}`}
					/>
				</div>
			)
		}

		return value ? (
			<div className="space-y-1">
				<span className="text-sm font-medium text-gray-700">{label}:</span>
				<span className="text-sm text-gray-900 ml-2">{value}</span>
			</div>
		) : null
	}

	const hasMetadata = metadata.category || metadata.color || metadata.pattern ||
		metadata.material || metadata.brand || metadata.style

	return (
		<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Brain className="text-blue-600" size={20} />
					<h3 className="font-semibold text-gray-900">AI Analysis</h3>
					{getStatusBadge()}
				</div>

				<div className="flex items-center gap-2">
					{metadata.confidence && (
						<span className="text-xs text-gray-500">
							{Math.round(metadata.confidence * 100)}% confidence
						</span>
					)}

					{isEditing ? (
						<div className="flex gap-1">
							<button
								onClick={handleSave}
								className="p-1 text-green-600 hover:bg-green-100 rounded"
								title="Save changes"
							>
								<Check size={16} />
							</button>
							<button
								onClick={handleCancel}
								className="p-1 text-red-600 hover:bg-red-100 rounded"
								title="Cancel editing"
							>
								<X size={16} />
							</button>
						</div>
					) : (
						<div className="flex gap-1">
							{onEdit && metadata.aiStatus === 'completed' && (
								<button
									onClick={onEdit}
									className="p-1 text-blue-600 hover:bg-blue-100 rounded"
									title="Edit AI metadata"
								>
									<Edit3 size={16} />
								</button>
							)}
							{onReanalyze && (
								<button
									onClick={onReanalyze}
									disabled={isReanalyzing || metadata.aiStatus === 'processing'}
									className="p-1 text-purple-600 hover:bg-purple-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
									title="Reanalyze with AI"
								>
									<RefreshCw size={16} className={isReanalyzing ? 'animate-spin' : ''} />
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{metadata.aiStatus === 'failed' && metadata.errorMessage && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
					<p className="text-sm text-red-700">{metadata.errorMessage}</p>
				</div>
			)}

			{metadata.aiStatus === 'pending' && (
				<div className="text-center py-4">
					<p className="text-sm text-gray-600">AI analysis will start shortly...</p>
				</div>
			)}

			{metadata.aiStatus === 'processing' && (
				<div className="text-center py-4">
					<div className="flex items-center justify-center gap-2">
						<RefreshCw size={16} className="animate-spin text-blue-600" />
						<p className="text-sm text-gray-600">Analyzing garment properties...</p>
					</div>
				</div>
			)}

			{(metadata.aiStatus === 'completed' || metadata.aiStatus === 'failed') && hasMetadata && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{renderField('Category', 'category', metadata.category)}
					{renderField('Subcategory', 'subcategory', metadata.subcategory)}
					{renderField('Primary Color', 'color', metadata.color)}
					{renderField('Pattern', 'pattern', metadata.pattern)}
					{renderField('Material', 'material', metadata.material)}
					{renderField('Brand', 'brand', metadata.brand)}
					{renderField('Style', 'style', metadata.style)}
				</div>
			)}

			{metadata.lastAnalyzed && (
				<div className="mt-4 pt-3 border-t border-blue-200">
					<p className="text-xs text-gray-500">
						Last analyzed: {new Date(metadata.lastAnalyzed).toLocaleString()}
					</p>
				</div>
			)}
		</div>
	)
}
