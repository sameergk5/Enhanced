import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import {
	SafeAreaView,
	StatusBar,
	StyleSheet
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';

// Import screens
import AvatarScreen from './screens/AvatarScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SocialScreen from './screens/SocialScreen';
import WardrobeScreen from './screens/WardrobeScreen';

// Import store
import { store } from './store/store';

// Import theme
import { theme } from './theme/theme';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
	return (
		<ReduxProvider store={store}>
			<PaperProvider theme={theme}>
				<NavigationContainer>
					<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
					<SafeAreaView style={styles.container}>
						<Tab.Navigator
							screenOptions={{
								tabBarActiveTintColor: '#6366F1',
								tabBarInactiveTintColor: '#6B7280',
								tabBarStyle: {
									backgroundColor: '#FFFFFF',
									borderTopColor: '#E5E7EB',
									borderTopWidth: 1,
								},
								headerStyle: {
									backgroundColor: '#FFFFFF',
								},
								headerTintColor: '#1F2937',
								headerTitleStyle: {
									fontWeight: 'bold',
								},
							}}>
							<Tab.Screen
								name="Home"
								component={HomeScreen}
								options={{
									tabBarLabel: 'Home',
									title: 'Wardrobe AI',
								}}
							/>
							<Tab.Screen
								name="Wardrobe"
								component={WardrobeScreen}
								options={{
									tabBarLabel: 'Wardrobe',
									title: 'My Wardrobe',
								}}
							/>
							<Tab.Screen
								name="Avatar"
								component={AvatarScreen}
								options={{
									tabBarLabel: 'Avatar',
									title: '3D Avatar',
								}}
							/>
							<Tab.Screen
								name="Social"
								component={SocialScreen}
								options={{
									tabBarLabel: 'Social',
									title: 'Community',
								}}
							/>
							<Tab.Screen
								name="Profile"
								component={ProfileScreen}
								options={{
									tabBarLabel: 'Profile',
									title: 'My Profile',
								}}
							/>
						</Tab.Navigator>
					</SafeAreaView>
				</NavigationContainer>
			</PaperProvider>
		</ReduxProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
});

export default App;
