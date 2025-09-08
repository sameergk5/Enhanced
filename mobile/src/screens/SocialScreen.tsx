import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';

const SocialScreen: React.FC = () => {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.sectionTitle}>Fashion Feed</Text>

				<Card style={styles.postCard}>
					<Card.Content>
						<View style={styles.postHeader}>
							<Avatar.Text size={40} label="JD" />
							<View style={styles.postMeta}>
								<Text style={styles.username}>@jane_doe</Text>
								<Text style={styles.timestamp}>2 hours ago</Text>
							</View>
						</View>
						<Text style={styles.postText}>
							Love this new summer outfit! Perfect for a day out ☀️
						</Text>
						<View style={styles.postActions}>
							<Button mode="text" icon="heart">❤️ 24</Button>
							<Button mode="text" icon="comment">💬 8</Button>
							<Button mode="text" icon="share">📤</Button>
						</View>
					</Card.Content>
				</Card>

				<Card style={styles.postCard}>
					<Card.Content>
						<View style={styles.postHeader}>
							<Avatar.Text size={40} label="MS" />
							<View style={styles.postMeta}>
								<Text style={styles.username}>@mike_styles</Text>
								<Text style={styles.timestamp}>4 hours ago</Text>
							</View>
						</View>
						<Text style={styles.postText}>
							Finally found the perfect blazer! AI recommendations are spot on 🎯
						</Text>
						<View style={styles.postActions}>
							<Button mode="text" icon="heart">❤️ 18</Button>
							<Button mode="text" icon="comment">💬 12</Button>
							<Button mode="text" icon="share">📤</Button>
						</View>
					</Card.Content>
				</Card>

				<Card style={styles.postCard}>
					<Card.Content>
						<View style={styles.postHeader}>
							<Avatar.Text size={40} label="AL" />
							<View style={styles.postMeta}>
								<Text style={styles.username}>@alex_lifestyle</Text>
								<Text style={styles.timestamp}>6 hours ago</Text>
							</View>
						</View>
						<Text style={styles.postText}>
							Minimalist wardrobe challenge: Day 30! Loving the simplicity 🌿
						</Text>
						<View style={styles.postActions}>
							<Button mode="text" icon="heart">❤️ 35</Button>
							<Button mode="text" icon="comment">💬 16</Button>
							<Button mode="text" icon="share">📤</Button>
						</View>
					</Card.Content>
				</Card>

				<Card style={styles.trendingCard}>
					<Card.Content>
						<Text style={styles.trendingTitle}>Trending Now</Text>
						<View style={styles.trendingTags}>
							<View style={styles.trendingTag}>
								<Text style={styles.tagText}>#SummerVibes</Text>
							</View>
							<View style={styles.trendingTag}>
								<Text style={styles.tagText}>#MinimalStyle</Text>
							</View>
							<View style={styles.trendingTag}>
								<Text style={styles.tagText}>#VintageFind</Text>
							</View>
							<View style={styles.trendingTag}>
								<Text style={styles.tagText}>#OOTD</Text>
							</View>
						</View>
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
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#1F2937',
		marginBottom: 16,
	},
	postCard: {
		marginBottom: 16,
		backgroundColor: '#FFFFFF',
	},
	postHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	postMeta: {
		marginLeft: 12,
		flex: 1,
	},
	username: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1F2937',
	},
	timestamp: {
		fontSize: 12,
		color: '#6B7280',
	},
	postText: {
		fontSize: 14,
		color: '#374151',
		lineHeight: 20,
		marginBottom: 12,
	},
	postActions: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	trendingCard: {
		backgroundColor: '#FFFFFF',
		marginTop: 8,
	},
	trendingTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1F2937',
		marginBottom: 12,
	},
	trendingTags: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	trendingTag: {
		backgroundColor: '#EEF2FF',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	tagText: {
		fontSize: 14,
		color: '#6366F1',
		fontWeight: '500',
	},
});

export default SocialScreen;
