import React, { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { ImagePickerResponse, launchCamera, launchImageLibrary, MediaType } from 'react-native-image-picker'
import { Button, Card, Chip } from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'

interface GarmentUploadScreenProps {
	navigation: any
	route?: {
		params?: {
			existingGarment?: any
		}
	}
}

const GarmentUploadScreen = ({ navigation, route }: GarmentUploadScreenProps) => {
	const dispatch = useDispatch()
	const { loading } = useSelector((state: RootState) => state.wardrobe)

	const existingGarment = route?.params?.existingGarment
	const isEditing = !!existingGarment

	const [photo, setPhoto] = useState<string | null>(existingGarment?.imageUrl || null)
	const [metadata, setMetadata] = useState({
		name: existingGarment?.name || '',
		description: existingGarment?.description || '',
		brand: existingGarment?.brand || '',
		size: existingGarment?.size || '',
		price: existingGarment?.price?.toString() || '',
		purchase_date: existingGarment?.purchase_date || '',
		tags: existingGarment?.tags || []
	})
	const [newTag, setNewTag] = useState('')
	const [uploading, setUploading] = useState(false)

	const handleSelectPhoto = () => {
		Alert.alert(
			'Select Photo',
			'Choose how you want to select a photo',
			[
				{ text: 'Camera', onPress: openCamera },
				{ text: 'Photo Library', onPress: openImageLibrary },
				{ text: 'Cancel', style: 'cancel' }
			]
		)
	}

	const openCamera = () => {
		const options = {
			mediaType: 'photo' as MediaType,
			quality: 0.8,
			maxWidth: 1024,
			maxHeight: 1024,
			includeBase64: false
		}

		launchCamera(options, handleImageResponse)
	}

	const openImageLibrary = () => {
		const options = {
			mediaType: 'photo' as MediaType,
			quality: 0.8,
			maxWidth: 1024,
			maxHeight: 1024,
			includeBase64: false,
			selectionLimit: 1
		}

		launchImageLibrary(options, handleImageResponse)
	}

	const handleImageResponse = (response: ImagePickerResponse) => {
		if (response.didCancel || response.errorMessage) {
			return
		}

		if (response.assets && response.assets[0]) {
			const asset = response.assets[0]
			if (asset.uri) {
				setPhoto(asset.uri)
			}
		}
	}

	const addTag = () => {
		if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
			setMetadata(prev => ({
				...prev,
				tags: [...prev.tags, newTag.trim()]
			}))
			setNewTag('')
		}
	}

	const removeTag = (tagToRemove: string) => {
		setMetadata(prev => ({
			...prev,
			tags: prev.tags.filter(tag => tag !== tagToRemove)
		}))
	}

	const handleSubmit = async () => {
		if (!photo) {
			Alert.alert('Error', 'Please select a photo')
			return
		}

		if (!metadata.name.trim()) {
			Alert.alert('Error', 'Please enter a garment name')
			return
		}

		try {
			setUploading(true)

			const formData = new FormData()

			// Add photo if it's a new photo (not an existing URL)
			if (photo && !photo.startsWith('http')) {
				formData.append('photo', {
					uri: Platform.OS === 'ios' ? photo.replace('file://', '') : photo,
					type: 'image/jpeg',
					name: 'garment.jpg'
				} as any)
			}

			// Add metadata
			Object.keys(metadata).forEach(key => {
				if (key === 'tags') {
					formData.append(key, JSON.stringify(metadata.tags))
				} else if (metadata[key as keyof typeof metadata]) {
					formData.append(key, metadata[key as keyof typeof metadata])
				}
			})

			let response
			if (isEditing) {
				response = await fetch(`${API_BASE}/api/garments/${existingGarment.id}`, {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${await getToken()}`,
						'Content-Type': 'multipart/form-data'
					},
					body: formData
				})
			} else {
				response = await fetch(`${API_BASE}/api/garments/upload`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${await getToken()}`,
						'Content-Type': 'multipart/form-data'
					},
					body: formData
				})
			}

			const data = await response.json()

			if (data.success) {
				Alert.alert(
					'Success',
					isEditing ? 'Garment updated successfully!' : 'Garment uploaded successfully!',
					[
						{
							text: 'OK',
							onPress: () => navigation.goBack()
						}
					]
				)
			} else {
				Alert.alert('Error', data.message || 'Failed to save garment')
			}
		} catch (error) {
			console.error('Upload error:', error)
			Alert.alert('Error', 'Network error. Please try again.')
		} finally {
			setUploading(false)
		}
	}

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
			<Card style={styles.card}>
				<Card.Content>
					<Text style={styles.title}>
						{isEditing ? 'Edit Garment' : 'Add New Garment'}
					</Text>

					{/* Photo Section */}
					<View style={styles.photoSection}>
						<Text style={styles.sectionTitle}>Photo</Text>
						{photo ? (
							<View style={styles.photoContainer}>
								<Image source={{ uri: photo }} style={styles.photoPreview} />
								<Button
									mode="outlined"
									onPress={handleSelectPhoto}
									style={styles.changePhotoButton}
								>
									Change Photo
								</Button>
							</View>
						) : (
							<TouchableOpacity style={styles.photoPlaceholder} onPress={handleSelectPhoto}>
								<Text style={styles.photoPlaceholderText}>Tap to select photo</Text>
							</TouchableOpacity>
						)}
					</View>

					{/* Basic Information */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Basic Information</Text>

						<TextInput
							style={styles.input}
							placeholder="Garment name *"
							value={metadata.name}
							onChangeText={(text) => setMetadata(prev => ({ ...prev, name: text }))}
						/>

						<TextInput
							style={[styles.input, styles.textArea]}
							placeholder="Description"
							value={metadata.description}
							onChangeText={(text) => setMetadata(prev => ({ ...prev, description: text }))}
							multiline
							numberOfLines={3}
						/>
					</View>

					{/* Details */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Details</Text>

						<TextInput
							style={styles.input}
							placeholder="Brand"
							value={metadata.brand}
							onChangeText={(text) => setMetadata(prev => ({ ...prev, brand: text }))}
						/>

						<TextInput
							style={styles.input}
							placeholder="Size"
							value={metadata.size}
							onChangeText={(text) => setMetadata(prev => ({ ...prev, size: text }))}
						/>

						<TextInput
							style={styles.input}
							placeholder="Price"
							value={metadata.price}
							onChangeText={(text) => setMetadata(prev => ({ ...prev, price: text }))}
							keyboardType="numeric"
						/>

						<TextInput
							style={styles.input}
							placeholder="Purchase date (YYYY-MM-DD)"
							value={metadata.purchase_date}
							onChangeText={(text) => setMetadata(prev => ({ ...prev, purchase_date: text }))}
						/>
					</View>

					{/* Tags */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Tags</Text>

						<View style={styles.tagInputContainer}>
							<TextInput
								style={[styles.input, styles.tagInput]}
								placeholder="Add tag"
								value={newTag}
								onChangeText={setNewTag}
								onSubmitEditing={addTag}
							/>
							<Button mode="outlined" onPress={addTag} style={styles.addTagButton}>
								Add
							</Button>
						</View>

						<View style={styles.tagsContainer}>
							{metadata.tags.map((tag, index) => (
								<Chip
									key={index}
									style={styles.tag}
									onClose={() => removeTag(tag)}
								>
									{tag}
								</Chip>
							))}
						</View>
					</View>
				</Card.Content>
			</Card>

			{/* Action Buttons */}
			<View style={styles.actionButtons}>
				<Button
					mode="outlined"
					onPress={() => navigation.goBack()}
					style={[styles.button, styles.cancelButton]}
					disabled={uploading}
				>
					Cancel
				</Button>

				<Button
					mode="contained"
					onPress={handleSubmit}
					style={[styles.button, styles.submitButton]}
					disabled={uploading || !photo || !metadata.name.trim()}
					loading={uploading}
				>
					{isEditing ? 'Update Garment' : 'Upload Garment'}
				</Button>
			</View>

			{uploading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#2196F3" />
					<Text style={styles.loadingText}>
						{isEditing ? 'Updating garment...' : 'Uploading garment...'}
					</Text>
				</View>
			)}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5'
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 100
	},
	card: {
		marginBottom: 16
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
		textAlign: 'center'
	},
	section: {
		marginBottom: 24
	},
	photoSection: {
		marginBottom: 24
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 12,
		color: '#333'
	},
	photoPlaceholder: {
		height: 200,
		backgroundColor: '#f0f0f0',
		borderRadius: 8,
		borderWidth: 2,
		borderColor: '#ddd',
		borderStyle: 'dashed',
		justifyContent: 'center',
		alignItems: 'center'
	},
	photoPlaceholderText: {
		fontSize: 16,
		color: '#666'
	},
	photoContainer: {
		alignItems: 'center'
	},
	photoPreview: {
		width: 200,
		height: 200,
		borderRadius: 8,
		marginBottom: 12
	},
	changePhotoButton: {
		marginTop: 8
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		backgroundColor: '#fff',
		fontSize: 16
	},
	textArea: {
		height: 80,
		textAlignVertical: 'top'
	},
	tagInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12
	},
	tagInput: {
		flex: 1,
		marginBottom: 0,
		marginRight: 8
	},
	addTagButton: {
		minWidth: 60
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8
	},
	tag: {
		marginBottom: 4
	},
	actionButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
		paddingHorizontal: 16
	},
	button: {
		flex: 1,
		marginHorizontal: 8
	},
	cancelButton: {
		borderColor: '#666'
	},
	submitButton: {
		backgroundColor: '#2196F3'
	},
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#666'
	}
})

// Helper functions (these would typically be in separate utility files)
const API_BASE = 'http://localhost:3001' // Replace with your API base URL

const getToken = async (): Promise<string> => {
	// This would typically use AsyncStorage or similar
	// return await AsyncStorage.getItem('token') || ''
	return '' // Placeholder
}

export default GarmentUploadScreen
