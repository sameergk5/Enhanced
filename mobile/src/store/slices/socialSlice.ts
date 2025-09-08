import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SocialPost {
	id: string;
	userId: string;
	username: string;
	userAvatar: string;
	content: string;
	imageUrl?: string;
	likes: number;
	comments: number;
	timestamp: string;
	isLiked: boolean;
}

interface SocialState {
	posts: SocialPost[];
	isLoading: boolean;
	error: string | null;
	refreshing: boolean;
}

const initialState: SocialState = {
	posts: [],
	isLoading: false,
	error: null,
	refreshing: false,
};

const socialSlice = createSlice({
	name: 'social',
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setRefreshing: (state, action: PayloadAction<boolean>) => {
			state.refreshing = action.payload;
		},
		setPosts: (state, action: PayloadAction<SocialPost[]>) => {
			state.posts = action.payload;
			state.isLoading = false;
			state.refreshing = false;
		},
		addPost: (state, action: PayloadAction<SocialPost>) => {
			state.posts.unshift(action.payload);
		},
		likePost: (state, action: PayloadAction<string>) => {
			const post = state.posts.find(p => p.id === action.payload);
			if (post) {
				post.isLiked = !post.isLiked;
				post.likes += post.isLiked ? 1 : -1;
			}
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
			state.isLoading = false;
			state.refreshing = false;
		},
	},
});

export const {
	setLoading,
	setRefreshing,
	setPosts,
	addPost,
	likePost,
	setError,
} = socialSlice.actions;

export default socialSlice.reducer;
