import React from 'react'
import { useStreak } from '../hooks/useStreak'

const Avatar: React.FC = () => {
	const { streak, loading, checkInToday, isCheckedInToday } = useStreak()
	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold mb-2">Avatar</h1>
			<p className="text-sm text-gray-600">Avatar management UI coming soon.</p>
			<div className="inline-flex items-center gap-3 rounded border px-4 py-2 bg-white shadow-sm">
				<span className="font-semibold">🔥 Streak:</span>
				{loading ? <span className="text-gray-500">Loading...</span> : (
					<span>{streak?.currentStreak || 0} day(s) (Max {streak?.longestStreak || 0})</span>
				)}
				<button
					disabled={loading || isCheckedInToday}
					className={`text-sm px-3 py-1 rounded ${isCheckedInToday ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
					onClick={() => checkInToday()}
				>
					{isCheckedInToday ? 'Checked In' : 'Check In'}
				</button>
			</div>
		</div>
	)
}

export default Avatar
