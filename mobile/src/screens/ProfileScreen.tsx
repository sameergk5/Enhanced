import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, List, Switch } from 'react-native-paper';

const ProfileScreen: React.FC = () => {
	const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
	const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

	return (
		<ScrollView style={styles.container}>
			<View style={styles.content}>
				<Card style={styles.profileCard}>
					<Card.Content>
						<View style={styles.profileHeader}>
							<Avatar.Text size={80} label="JD" />
							<View style={styles.profileInfo}>
								<Text style={styles.profileName}>Jane Doe</Text>
								<Text style={styles.profileEmail}>jane.doe@example.com</Text>
								<Text style={styles.profileStats}>156 items • 42 outfits</Text>
							</View>
						</View>
						<Button
							mode="outlined"
							style={styles.editButton}
							onPress={() => console.log('Edit profile')}
						>
							Edit Profile
						</Button>
					</Card.Content>
				</Card>

				<Card style={styles.settingsCard}>
					<Card.Content>
						<Text style={styles.sectionTitle}>Preferences</Text>

						<List.Item
							title="Style Preferences"
							description="Casual, Minimalist, Trendy"
							left={props => <List.Icon {...props} icon="palette" />}
							right={props => <List.Icon {...props} icon="chevron-right" />}
							onPress={() => console.log('Style preferences')}
						/>

						<List.Item
							title="Size Profile"
							description="Size M, US 8, EU 38"
							left={props => <List.Icon {...props} icon="ruler" />}
							right={props => <List.Icon {...props} icon="chevron-right" />}
							onPress={() => console.log('Size profile')}
						/>

						<List.Item
							title="Favorite Brands"
							description="Zara, H&M, Uniqlo, +3 more"
							left={props => <List.Icon {...props} icon="star" />}
							right={props => <List.Icon {...props} icon="chevron-right" />}
							onPress={() => console.log('Favorite brands')}
						/>
					</Card.Content>
				</Card>

				<Card style={styles.settingsCard}>
					<Card.Content>
						<Text style={styles.sectionTitle}>Settings</Text>

						<List.Item
							title="Notifications"
							description="Get alerts for new recommendations"
							left={props => <List.Icon {...props} icon="bell" />}
							right={() => (
								<Switch
									value={notificationsEnabled}
									onValueChange={setNotificationsEnabled}
								/>
							)}
						/>

						<List.Item
							title="Dark Mode"
							description="Switch to dark theme"
							left={props => <List.Icon {...props} icon="theme-light-dark" />}
							right={() => (
								<Switch
									value={darkModeEnabled}
									onValueChange={setDarkModeEnabled}
								/>
							)}
						/>

						<List.Item
							title="Privacy"
							description="Manage your privacy settings"
							left={props => <List.Icon {...props} icon="shield-account" />}
							right={props => <List.Icon {...props} icon="chevron-right" />}
							onPress={() => console.log('Privacy settings')}
						/>
					</Card.Content>
				</Card>

				<Card style={styles.settingsCard}>
					<Card.Content>
						<Text style={styles.sectionTitle}>Support</Text>

						<List.Item
							title="Help Center"
							description="Get help and support"
							left={props => <List.Icon {...props} icon="help-circle" />}
							right={props => <List.Icon {...props} icon="chevron-right" />}
							onPress={() => console.log('Help center')}
						/>

						<List.Item
							title="Send Feedback"
							description="Help us improve the app"
							left={props => <List.Icon {...props} icon="message-text" />}
							right={props => <List.Icon {...props} icon="chevron-right" />}
							onPress={() => console.log('Send feedback')}
						/>

						<List.Item
							title="Sign Out"
							description="Sign out of your account"
							left={props => <List.Icon {...props} icon="logout" />}
							right={props => <List.Icon {...props} icon="chevron-right" />}
							onPress={() => console.log('Sign out')}
						/>
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
	profileCard: {
		marginBottom: 16,
		backgroundColor: '#FFFFFF',
	},
	profileHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	profileInfo: {
		marginLeft: 16,
		flex: 1,
	},
	profileName: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#1F2937',
	},
	profileEmail: {
		fontSize: 14,
		color: '#6B7280',
		marginTop: 2,
	},
	profileStats: {
		fontSize: 12,
		color: '#6366F1',
		marginTop: 4,
	},
	editButton: {
		borderColor: '#6366F1',
	},
	settingsCard: {
		marginBottom: 16,
		backgroundColor: '#FFFFFF',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1F2937',
		marginBottom: 8,
	},
});

export default ProfileScreen;
