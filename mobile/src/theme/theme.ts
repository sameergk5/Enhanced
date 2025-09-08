import { DefaultTheme } from 'react-native-paper';

export const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#6366F1',
		accent: '#10B981',
		background: '#F9FAFB',
		surface: '#FFFFFF',
		text: '#1F2937',
		disabled: '#9CA3AF',
		placeholder: '#6B7280',
		backdrop: 'rgba(0, 0, 0, 0.5)',
		notification: '#EF4444',
	},
	fonts: {
		...DefaultTheme.fonts,
		regular: {
			fontFamily: 'System',
			fontWeight: '400' as '400',
		},
		medium: {
			fontFamily: 'System',
			fontWeight: '500' as '500',
		},
		light: {
			fontFamily: 'System',
			fontWeight: '300' as '300',
		},
		thin: {
			fontFamily: 'System',
			fontWeight: '100' as '100',
		},
	},
};

export const darkTheme = {
	...theme,
	colors: {
		...theme.colors,
		primary: '#8B5CF6',
		background: '#111827',
		surface: '#1F2937',
		text: '#F9FAFB',
		disabled: '#4B5563',
		placeholder: '#9CA3AF',
	},
};
