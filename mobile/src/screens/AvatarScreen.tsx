import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';

const AvatarScreen: React.FC = () => {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.content}>
				<Card style={styles.avatarCard}>
					<Card.Content>
						<Text style={styles.avatarTitle}>Your 3D Avatar</Text>
						<View style={styles.avatarPlaceholder}>
							<Text style={styles.avatarEmoji}>🧍‍♀️</Text>
							<Text style={styles.avatarText}>3D Avatar Preview</Text>
						</View>
						<Button
							mode="contained"
							style={styles.customizeButton}
							onPress={() => console.log('Customize avatar')}
						>
							Customize Avatar
						</Button>
					</Card.Content>
				</Card>

				<Card style={styles.measurementsCard}>
					<Card.Content>
						<Text style={styles.sectionTitle}>Body Measurements</Text>
						<View style={styles.measurementItem}>
							<Text style={styles.measurementLabel}>Height</Text>
							<Text style={styles.measurementValue}>5'6"</Text>
						</View>
						<View style={styles.measurementItem}>
							<Text style={styles.measurementLabel}>Chest</Text>
							<Text style={styles.measurementValue}>36"</Text>
						</View>
						<View style={styles.measurementItem}>
							<Text style={styles.measurementLabel}>Waist</Text>
							<Text style={styles.measurementValue}>28"</Text>
						</View>
						<View style={styles.measurementItem}>
							<Text style={styles.measurementLabel}>Hips</Text>
							<Text style={styles.measurementValue}>38"</Text>
						</View>
						<Button
							mode="outlined"
							style={styles.updateButton}
							onPress={() => console.log('Update measurements')}
						>
							Update Measurements
						</Button>
					</Card.Content>
				</Card>

				<Card style={styles.tryOnCard}>
					<Card.Content>
						<Text style={styles.sectionTitle}>Virtual Try-On</Text>
						<Text style={styles.tryOnDescription}>
							See how clothes look on your personalized 3D avatar
						</Text>
						<Button
							mode="contained"
							style={styles.tryOnButton}
							onPress={() => console.log('Start try-on')}
						>
							Start Virtual Try-On
						</Button>
					</Card.Content>
				</Card>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	content: {
		padding: 16,
	},
	avatarCard: {
		marginBottom: 16,
		backgroundColor: '#FFFFFF',
	},
	avatarTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#1F2937',
		marginBottom: 16,
		textAlign: 'center',
	},
	avatarPlaceholder: {
		alignItems: 'center',
		padding: 32,
		backgroundColor: '#F3F4F6',
		borderRadius: 12,
		marginBottom: 16,
	},
	avatarEmoji: {
		fontSize: 64,
		marginBottom: 8,
	},
	avatarText: {
		fontSize: 16,
		color: '#6B7280',
	},
	customizeButton: {
		backgroundColor: '#6366F1',
	},
	measurementsCard: {
		marginBottom: 16,
		backgroundColor: '#FFFFFF',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1F2937',
		marginBottom: 16,
	},
	measurementItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	measurementLabel: {
		fontSize: 16,
		color: '#374151',
	},
	measurementValue: {
		fontSize: 16,
		fontWeight: '600',
		color: '#6366F1',
	},
	updateButton: {
		marginTop: 16,
		borderColor: '#6366F1',
	},
	tryOnCard: {
		backgroundColor: '#FFFFFF',
	},
	tryOnDescription: {
		fontSize: 14,
		color: '#6B7280',
		marginBottom: 16,
		textAlign: 'center',
	},
	tryOnButton: {
		backgroundColor: '#10B981',
	},
});

export default AvatarScreen;
