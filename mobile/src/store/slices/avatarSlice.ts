import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Avatar {
	id: string;
	height: number;
	measurements: {
		chest: number;
		waist: number;
		hips: number;
	};
	skinTone: string;
	hairColor: string;
	hairStyle: string;
	bodyType: string;
}

interface AvatarState {
	avatar: Avatar | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: AvatarState = {
	avatar: null,
	isLoading: false,
	error: null,
};

const avatarSlice = createSlice({
	name: 'avatar',
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setAvatar: (state, action: PayloadAction<Avatar>) => {
			state.avatar = action.payload;
			state.isLoading = false;
		},
		updateAvatar: (state, action: PayloadAction<Partial<Avatar>>) => {
			if (state.avatar) {
				state.avatar = { ...state.avatar, ...action.payload };
			}
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
			state.isLoading = false;
		},
	},
});

export const { setLoading, setAvatar, updateAvatar, setError } = avatarSlice.actions;

export default avatarSlice.reducer;
