import React, { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { ImagePickerResponse, launchImageLibrary, MediaType } from 'react-native-image-picker'
import { Button, Card, Paragraph, Title } from 'react-native-paper'
import { useDispatch } from 'react-redux'

import { createAvatarFromPhoto } from '../store/slices/avatarSlice'

interface Measurements {
	height: string
	weight: string
	chest: string
	waist: string
	hips: string
	shoulder_width: string
}

interface Preferences {
	build: string
	skin_tone: string
	hair_color: string
	eye_color: string
}

const AvatarCreationScreen = ({ navigation }: any) => {
	const dispatch = useDispatch()
	const [step, setStep] = useState(1)
	const [loading, setLoading] = useState(false)
	const [photo, setPhoto] = useState<any>(null)
	const [measurements, setMeasurements] = useState<Measurements>({
		height: '',
		weight: '',
		chest: '',
		waist: '',
		hips: '',
		shoulder_width: ''
	})
	const [preferences, setPreferences] = useState<Preferences>({
		build: 'medium',
		skin_tone: 'medium',
		hair_color: 'brown',
		eye_color: 'brown'
	})

	const selectPhoto = () => {
		const options = {
			mediaType: 'photo' as MediaType,
			quality: 0.8,
			maxWidth: 1024,
			maxHeight: 1024
		}

		launchImageLibrary(options, (response: ImagePickerResponse) => {
			if (response.didCancel || response.errorMessage) {
				return
			}

			if (response.assets && response.assets[0]) {
				const asset = response.assets[0]

				// Validate file size (10MB limit)
				if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
					Alert.alert('Error', 'File size must be less than 10MB')
					return
				}

				setPhoto(asset)
				setStep(2)
			}
		})
	}

	const handleCreateAvatar = async () => {
		if (!photo) {
			Alert.alert('Error', 'Please select a photo first')
			return
		}

		setLoading(true)

		try {
			const formData = new FormData()

			formData.append('photo', {
				uri: photo.uri,
				type: photo.type,
				name: photo.fileName || 'avatar.jpg'
			} as any)

			// Add measurements if provided
			const validMeasurements = Object.fromEntries(
				Object.entries(measurements).filter(([, value]) => value !== '')
			)
			if (Object.keys(validMeasurements).length > 0) {
				formData.append('measurements', JSON.stringify(validMeasurements))
			}

			// Add preferences
			formData.append('preferences', JSON.stringify(preferences))

			const result = await dispatch(createAvatarFromPhoto(formData) as any)

			if (result.type === 'avatar/createFromPhoto/fulfilled') {
				Alert.alert(
					'Success',
					'Avatar created successfully!',
					[{ text: 'OK', onPress: () => navigation.goBack() }]
				)
			} else {
				throw new Error(result.error?.message || 'Avatar creation failed')
			}
		} catch (error) {
			Alert.alert('Error', error.message || 'Avatar creation failed')
		} finally {
			setLoading(false)
		}
	}

	const renderStepIndicator = () => (
		<View style={styles.stepIndicator}>
			<View style={[styles.step, step >= 1 && styles.stepActive]}>
				<Text style={[styles.stepText, step >= 1 && styles.stepTextActive]}>1</Text>
			</View>
			<View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
			<View style={[styles.step, step >= 2 && styles.stepActive]}>
				<Text style={[styles.stepText, step >= 2 && styles.stepTextActive]}>2</Text>
			</View>
			<View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
			<View style={[styles.step, step >= 3 && styles.stepActive]}>
				<Text style={[styles.stepText, step >= 3 && styles.stepTextActive]}>3</Text>
			</View>
		</View>
	)

	const renderPhotoStep = () => (
		<Card style={styles.card}>
			<Card.Content>
				<Title>Upload Your Photo</Title>
				<Paragraph style={styles.subtitle}>
					Take or select a clear photo of yourself
				</Paragraph>

				{photo ? (
					<View style={styles.photoContainer}>
						<Image source={{ uri: photo.uri }} style={styles.photoPreview} />
						<Button mode="outlined" onPress={selectPhoto} style={styles.changePhotoButton}>
							Change Photo
						</Button>
					</View>
				) : (
					<TouchableOpacity style={styles.photoUpload} onPress={selectPhoto}>
						<Text style={styles.uploadIcon}>📷</Text>
						<Text style={styles.uploadText}>Tap to Select Photo</Text>
						<Text style={styles.uploadSubtext}>JPEG, PNG • Max 10MB</Text>
					</TouchableOpacity>
				)}

				<Card style={styles.tipsCard}>
					<Card.Content>
						<Title style={styles.tipsTitle}>Photo Tips:</Title>
						<Text style={styles.tipText}>• Use a clear, well-lit photo</Text>
						<Text style={styles.tipText}>• Face the camera directly</Text>
						<Text style={styles.tipText}>• Avoid sunglasses or face coverings</Text>
						<Text style={styles.tipText}>• Higher resolution photos work better</Text>
					</Card.Content>
				</Card>

				<View style={styles.buttonContainer}>
					<Button mode="outlined" onPress={() => navigation.goBack()}>
						Cancel
					</Button>
					<Button
						mode="contained"
						onPress={() => setStep(2)}
						disabled={!photo}
						style={styles.nextButton}
					>
						Next
					</Button>
				</View>
			</Card.Content>
		</Card>
	)

	const renderMeasurementsStep = () => (
		<Card style={styles.card}>
			<Card.Content>
				<Title>Body Measurements</Title>
				<Paragraph style={styles.subtitle}>
					Provide measurements for a more accurate avatar (optional)
				</Paragraph>

				<View style={styles.inputContainer}>
					<Text style={styles.inputLabel}>Height (cm)</Text>
					<TextInput
						style={styles.input}
						value={measurements.height}
						onChangeText={(value) => setMeasurements(prev => ({ ...prev, height: value }))}
						placeholder="170"
						keyboardType="numeric"
					/>
				</View>

				<View style={styles.inputContainer}>
					<Text style={styles.inputLabel}>Weight (kg)</Text>
					<TextInput
						style={styles.input}
						value={measurements.weight}
						onChangeText={(value) => setMeasurements(prev => ({ ...prev, weight: value }))}
						placeholder="70"
						keyboardType="numeric"
					/>
				</View>

				<View style={styles.inputRow}>
					<View style={styles.halfInput}>
						<Text style={styles.inputLabel}>Chest (cm)</Text>
						<TextInput
							style={styles.input}
							value={measurements.chest}
							onChangeText={(value) => setMeasurements(prev => ({ ...prev, chest: value }))}
							placeholder="90"
							keyboardType="numeric"
						/>
					</View>
					<View style={styles.halfInput}>
						<Text style={styles.inputLabel}>Waist (cm)</Text>
						<TextInput
							style={styles.input}
							value={measurements.waist}
							onChangeText={(value) => setMeasurements(prev => ({ ...prev, waist: value }))}
							placeholder="75"
							keyboardType="numeric"
						/>
					</View>
				</View>

				<View style={styles.buttonContainer}>
					<Button mode="outlined" onPress={() => setStep(1)}>
						Back
					</Button>
					<Button mode="contained" onPress={() => setStep(3)} style={styles.nextButton}>
						Next
					</Button>
				</View>
			</Card.Content>
		</Card>
	)

	const renderPreferencesStep = () => (
		<Card style={styles.card}>
			<Card.Content>
				<Title>Avatar Preferences</Title>
				<Paragraph style={styles.subtitle}>
					Customize your avatar's appearance
				</Paragraph>

				<View style={styles.preferenceContainer}>
					<Text style={styles.inputLabel}>Build</Text>
					<View style={styles.optionRow}>
						{['slim', 'medium', 'athletic', 'curvy'].map((option) => (
							<TouchableOpacity
								key={option}
								style={[
									styles.optionButton,
									preferences.build === option && styles.optionButtonSelected
								]}
								onPress={() => setPreferences(prev => ({ ...prev, build: option }))}
							>
								<Text style={[
									styles.optionText,
									preferences.build === option && styles.optionTextSelected
								]}>
									{option.charAt(0).toUpperCase() + option.slice(1)}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View style={styles.preferenceContainer}>
					<Text style={styles.inputLabel}>Skin Tone</Text>
					<View style={styles.optionRow}>
						{['light', 'medium', 'medium_dark', 'dark'].map((option) => (
							<TouchableOpacity
								key={option}
								style={[
									styles.optionButton,
									preferences.skin_tone === option && styles.optionButtonSelected
								]}
								onPress={() => setPreferences(prev => ({ ...prev, skin_tone: option }))}
							>
								<Text style={[
									styles.optionText,
									preferences.skin_tone === option && styles.optionTextSelected
								]}>
									{option.replace('_', ' ').split(' ').map(word =>
										word.charAt(0).toUpperCase() + word.slice(1)
									).join(' ')}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View style={styles.buttonContainer}>
					<Button mode="outlined" onPress={() => setStep(2)}>
						Back
					</Button>
					<Button
						mode="contained"
						onPress={handleCreateAvatar}
						disabled={loading}
						style={styles.nextButton}
					>
						{loading ? (
							<ActivityIndicator color="white" size="small" />
						) : (
							'Create Avatar'
						)}
					</Button>
				</View>
			</Card.Content>
		</Card>
	)

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Title style={styles.title}>Create Your 3D Avatar</Title>
				{renderStepIndicator()}
			</View>

			{step === 1 && renderPhotoStep()}
			{step === 2 && renderMeasurementsStep()}
			{step === 3 && renderPreferencesStep()}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5'
	},
	header: {
		padding: 20,
		backgroundColor: 'white'
	},
	title: {
		textAlign: 'center',
		marginBottom: 20
	},
	stepIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},
	step: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: '#e0e0e0',
		alignItems: 'center',
		justifyContent: 'center'
	},
	stepActive: {
		backgroundColor: '#2196F3'
	},
	stepText: {
		color: '#666',
		fontWeight: 'bold'
	},
	stepTextActive: {
		color: 'white'
	},
	stepLine: {
		width: 40,
		height: 2,
		backgroundColor: '#e0e0e0'
	},
	stepLineActive: {
		backgroundColor: '#2196F3'
	},
	card: {
		margin: 16,
		elevation: 4
	},
	subtitle: {
		marginBottom: 20,
		color: '#666'
	},
	photoContainer: {
		alignItems: 'center',
		marginBottom: 20
	},
	photoPreview: {
		width: 200,
		height: 200,
		borderRadius: 10,
		marginBottom: 10
	},
	changePhotoButton: {
		marginTop: 10
	},
	photoUpload: {
		borderWidth: 2,
		borderColor: '#ddd',
		borderStyle: 'dashed',
		borderRadius: 10,
		padding: 40,
		alignItems: 'center',
		marginBottom: 20
	},
	uploadIcon: {
		fontSize: 48,
		marginBottom: 10
	},
	uploadText: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5
	},
	uploadSubtext: {
		color: '#666',
		fontSize: 12
	},
	tipsCard: {
		backgroundColor: '#e3f2fd',
		marginBottom: 20
	},
	tipsTitle: {
		fontSize: 16,
		marginBottom: 10
	},
	tipText: {
		fontSize: 14,
		marginBottom: 5,
		color: '#1976d2'
	},
	inputContainer: {
		marginBottom: 15
	},
	inputRow: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	halfInput: {
		flex: 0.48
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: 'bold',
		marginBottom: 5,
		color: '#333'
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: 'white'
	},
	preferenceContainer: {
		marginBottom: 20
	},
	optionRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 5
	},
	optionButton: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 20,
		paddingHorizontal: 15,
		paddingVertical: 8,
		margin: 4,
		backgroundColor: 'white'
	},
	optionButtonSelected: {
		backgroundColor: '#2196F3',
		borderColor: '#2196F3'
	},
	optionText: {
		fontSize: 14,
		color: '#666'
	},
	optionTextSelected: {
		color: 'white',
		fontWeight: 'bold'
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20
	},
	nextButton: {
		flex: 1,
		marginLeft: 10
	}
})

export default AvatarCreationScreen
