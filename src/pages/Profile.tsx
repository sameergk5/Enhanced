import React from 'react'
import WardrobeVisibilitySelector from '../components/profile/WardrobeVisibilitySelector'

// Simple Profile page for Task 5.1 (frontend-only state)
// Future tasks (5.2 / 5.3) will integrate real backend preferences & permissions

const Profile: React.FC = () => {
	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Profile</h1>
				<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage how others can view your wardrobe & looks.</p>
			</header>

			<section className="mb-10 space-y-6">
				<WardrobeVisibilitySelector />
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">About You (Optional)</h2>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-1">
						<label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
						<input id="displayName" placeholder="Coming soon" disabled className="rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
					</div>
					<div className="flex flex-col gap-1 md:col-span-2">
						<label htmlFor="bio" className="text-sm font-medium">Bio</label>
						<textarea id="bio" rows={3} placeholder="Coming soon" disabled className="rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
					</div>
				</div>
				<p className="text-xs text-gray-500 dark:text-gray-500">Profile fields will be editable after backend integration (Task 5.3).</p>
			</section>
		</div>
	)
}

export default Profile
