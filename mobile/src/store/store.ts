import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import avatarSlice from './slices/avatarSlice';
import socialSlice from './slices/socialSlice';
import wardrobeSlice from './slices/wardrobeSlice';

export const store = configureStore({
	reducer: {
		auth: authSlice,
		wardrobe: wardrobeSlice,
		avatar: avatarSlice,
		social: socialSlice,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ['persist/PERSIST'],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
