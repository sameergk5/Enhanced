import { useCallback, useEffect, useState } from 'react'
import { fetchStreak, pingStreak, type StreakInfo } from '../services/streak'

interface UseStreak {
	streak: StreakInfo | null
	loading: boolean
	error: string | null
	refresh: () => Promise<void>
	checkInToday: () => Promise<void>
	isCheckedInToday: boolean
}

function isSameUTCDate(a: Date, b: Date) {
	return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate()
}

export function useStreak(): UseStreak {
	const [streak, setStreak] = useState<StreakInfo | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const data = await fetchStreak()
			setStreak(data)
		} catch (e: any) {
			setError(e.message || 'Failed to load streak')
		} finally {
			setLoading(false)
		}
	}, [])

	const checkInToday = useCallback(async () => {
		try {
			const updated = await pingStreak()
			setStreak(updated)
		} catch (e: any) {
			setError(e.message || 'Failed to update streak')
		}
	}, [])

	useEffect(() => { load() }, [load])

	const isCheckedInToday = (() => {
		if (!streak?.lastActivityAt) return false
		const last = new Date(streak.lastActivityAt)
		return isSameUTCDate(new Date(), last)
	})()

	return { streak, loading, error, refresh: load, checkInToday, isCheckedInToday }
}
