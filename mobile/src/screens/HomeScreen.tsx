import React from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Card, FAB } from 'react-native-paper';

const HomeScreen: React.FC = () => {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.content}>
				<Card style={styles.welcomeCard}>
					<Card.Content>
						<Text style={styles.welcomeTitle}>Welcome to Wardrobe AI</Text>
						<Text style={styles.welcomeSubtitle}>
							Your personal AI-powered fashion assistant
						</Text>
					</Card.Content>
				</Card>

				<View style={styles.quickActions}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>

					<TouchableOpacity style={styles.actionCard}>
						<Text style={styles.actionTitle}>📸 Try On Outfit</Text>
						<Text style={styles.actionDescription}>
							Use your camera to virtually try on clothes
						</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.actionCard}>
						<Text style={styles.actionTitle}>👗 Browse Wardrobe</Text>
						<Text style={styles.actionDescription}>
							View and organize your clothing collection
						</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.actionCard}>
						<Text style={styles.actionTitle}>🤖 AI Styling</Text>
						<Text style={styles.actionDescription}>
							Get personalized outfit recommendations
						</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.actionCard}>
						<Text style={styles.actionTitle}>👥 Social Feed</Text>
						<Text style={styles.actionDescription}>
							See what's trending in fashion
						</Text>
					</TouchableOpacity>
				</View>

				<Card style={styles.statsCard}>
					<Card.Content>
						<Text style={styles.statsTitle}>Your Fashion Stats</Text>
						<View style={styles.statsRow}>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>42</Text>
								<Text style={styles.statLabel}>Outfits</Text>
							</View>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>156</Text>
								<Text style={styles.statLabel}>Items</Text>
							</View>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>8</Text>
								<Text style={styles.statLabel}>Looks Shared</Text>
							</View>
						</View>
					</Card.Content>
				</Card>
			</View>

			<FAB
				icon="camera"
				style={styles.fab}
				onPress={() => console.log('Camera pressed')}
			/>
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
		paddingBottom: 80,
	},
	welcomeCard: {
		marginBottom: 24,
		backgroundColor: '#6366F1',
	},
	welcomeTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 8,
	},
	welcomeSubtitle: {
		fontSize: 16,
		color: '#E0E7FF',
	},
	quickActions: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#1F2937',
		marginBottom: 16,
	},
	actionCard: {
		backgroundColor: '#FFFFFF',
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	actionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1F2937',
		marginBottom: 4,
	},
	actionDescription: {
		fontSize: 14,
		color: '#6B7280',
	},
	statsCard: {
		backgroundColor: '#FFFFFF',
	},
	statsTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1F2937',
		marginBottom: 16,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#6366F1',
	},
	statLabel: {
		fontSize: 12,
		color: '#6B7280',
		marginTop: 4,
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: '#6366F1',
	},
});

export default HomeScreen;
