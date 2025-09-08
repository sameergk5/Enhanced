import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, FAB } from 'react-native-paper';

const WardrobeScreen: React.FC = () => {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.content}>
				<View style={styles.categoriesContainer}>
					<Text style={styles.sectionTitle}>Categories</Text>
					<View style={styles.chipContainer}>
						<Chip style={styles.chip} selected>All</Chip>
						<Chip style={styles.chip}>Tops</Chip>
						<Chip style={styles.chip}>Bottoms</Chip>
						<Chip style={styles.chip}>Dresses</Chip>
						<Chip style={styles.chip}>Shoes</Chip>
						<Chip style={styles.chip}>Accessories</Chip>
					</View>
				</View>

				<Text style={styles.sectionTitle}>Your Items</Text>

				<View style={styles.itemsGrid}>
					<Card style={styles.itemCard}>
						<Card.Content>
							<Text style={styles.itemTitle}>Blue Denim Jacket</Text>
							<Text style={styles.itemBrand}>Levi's</Text>
							<Text style={styles.itemCategory}>Outerwear</Text>
						</Card.Content>
					</Card>

					<Card style={styles.itemCard}>
						<Card.Content>
							<Text style={styles.itemTitle}>White Cotton Tee</Text>
							<Text style={styles.itemBrand}>Uniqlo</Text>
							<Text style={styles.itemCategory}>Tops</Text>
						</Card.Content>
					</Card>

					<Card style={styles.itemCard}>
						<Card.Content>
							<Text style={styles.itemTitle}>Black Skinny Jeans</Text>
							<Text style={styles.itemBrand}>Zara</Text>
							<Text style={styles.itemCategory}>Bottoms</Text>
						</Card.Content>
					</Card>

					<Card style={styles.itemCard}>
						<Card.Content>
							<Text style={styles.itemTitle}>Summer Dress</Text>
							<Text style={styles.itemBrand}>H&M</Text>
							<Text style={styles.itemCategory}>Dresses</Text>
						</Card.Content>
					</Card>
				</View>
			</View>

			<FAB
				icon="plus"
				style={styles.fab}
				onPress={() => console.log('Add item pressed')}
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
	categoriesContainer: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#1F2937',
		marginBottom: 16,
	},
	chipContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	chip: {
		marginRight: 8,
		marginBottom: 8,
	},
	itemsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	itemCard: {
		width: '48%',
		marginBottom: 16,
		backgroundColor: '#FFFFFF',
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1F2937',
		marginBottom: 4,
	},
	itemBrand: {
		fontSize: 14,
		color: '#6366F1',
		marginBottom: 2,
	},
	itemCategory: {
		fontSize: 12,
		color: '#6B7280',
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: '#6366F1',
	},
});

export default WardrobeScreen;
