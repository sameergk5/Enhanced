import axios from 'axios';
import Config from 'react-native-config';

const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
	(config) => {
		// Add auth token if available
		// const token = getAuthToken();
		// if (token) {
		//   config.headers.Authorization = `Bearer ${token}`;
		// }
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access
			// logout();
		}
		return Promise.reject(error);
	}
);

export default apiClient;
