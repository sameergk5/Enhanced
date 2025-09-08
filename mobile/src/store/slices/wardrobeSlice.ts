import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WardrobeItem {
	id: string;
	name: string;
	brand: string;
	category: string;
	color: string;
	size: string;
	imageUrl?: string;
	tags: string[];
	lastWorn?: string;
}

interface WardrobeState {
	items: WardrobeItem[];
	isLoading: boolean;
	error: string | null;
	selectedCategory: string;
}

const initialState: WardrobeState = {
	items: [],
	isLoading: false,
	error: null,
	selectedCategory: 'all',
};

const wardrobeSlice = createSlice({
	name: 'wardrobe',
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setItems: (state, action: PayloadAction<WardrobeItem[]>) => {
			state.items = action.payload;
			state.isLoading = false;
		},
		addItem: (state, action: PayloadAction<WardrobeItem>) => {
			state.items.push(action.payload);
		},
		updateItem: (state, action: PayloadAction<WardrobeItem>) => {
			const index = state.items.findIndex(item => item.id === action.payload.id);
			if (index !== -1) {
				state.items[index] = action.payload;
			}
		},
		removeItem: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter(item => item.id !== action.payload);
		},
		setSelectedCategory: (state, action: PayloadAction<string>) => {
			state.selectedCategory = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
			state.isLoading = false;
		},
	},
});

export const {
	setLoading,
	setItems,
	addItem,
	updateItem,
	removeItem,
	setSelectedCategory,
	setError,
} = wardrobeSlice.actions;

export default wardrobeSlice.reducer;
