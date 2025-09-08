import React, { useEffect, useState } from 'react'
import { loadProfilePreferences, saveProfilePreferences, WardrobeVisibility } from '../../services/profilePreferences'
import { fetchVisibility, updateVisibility } from '../../services/visibilityApi'

interface FetchState {
	loading: boolean
	error: string | null
}

interface Props {
	value?: WardrobeVisibility
	onChange?: (v: WardrobeVisibility) => void
	showLabel?: boolean
}

const OPTIONS: { value: WardrobeVisibility; label: string; desc: string }[] = [
	{ value: 'private', label: 'Private', desc: 'Only you can view your wardrobe & looks.' },
	{ value: 'friends', label: 'Friends', desc: 'Visible to approved friends.' },
	{ value: 'public', label: 'Public', desc: 'Anyone can view shared wardrobe content.' }
]

export const WardrobeVisibilitySelector: React.FC<Props> = ({ value, onChange, showLabel = true }) => {
	const [internal, setInternal] = useState<WardrobeVisibility>('private')
	const [state, setState] = useState<FetchState>({ loading: true, error: null })
	const [optimistic, setOptimistic] = useState<WardrobeVisibility | null>(null)

	useEffect(() => {
		if (value) return // controlled
		let cancelled = false
			; (async () => {
				try {
					// First show local preference quickly
					const local = loadProfilePreferences()
					if (!cancelled) setInternal(local.wardrobeVisibility)
					// Then fetch authoritative backend value
					const vis = await fetchVisibility()
					if (!cancelled) {
						setInternal(vis)
						// sync local storage for offline usage
						saveProfilePreferences({ ...local, wardrobeVisibility: vis })
					}
					if (!cancelled) setState({ loading: false, error: null })
				} catch (e: any) {
					if (!cancelled) setState({ loading: false, error: e.message || 'Failed to load visibility' })
				}
			})()
		return () => {
			cancelled = true
		}
	}, [value])

	const current = value ?? (optimistic ?? internal)

	const update = async (v: WardrobeVisibility) => {
		if (value) {
			onChange?.(v)
			return
		}
		// optimistic UI
		setOptimistic(v)
		onChange?.(v)
		const existing = loadProfilePreferences()
		saveProfilePreferences({ ...existing, wardrobeVisibility: v })
		try {
			const confirmed = await updateVisibility(v)
			setInternal(confirmed)
			setOptimistic(null)
		} catch (e) {
			// rollback
			setOptimistic(null)
			setInternal(existing.wardrobeVisibility)
			// store rollback value
			saveProfilePreferences(existing)
		}
	}

	return (
		<fieldset className="space-y-3" aria-label="Wardrobe visibility settings">
			{showLabel && <legend className="text-lg font-semibold">Wardrobe Visibility</legend>}
			{state.loading && <p className="text-xs text-gray-500">Loading visibility...</p>}
			{state.error && <p className="text-xs text-red-500">{state.error}</p>}
			<div className="grid gap-3 md:grid-cols-3">
				{OPTIONS.map(opt => {
					const selected = current === opt.value
					return (
						<label
							key={opt.value}
							className={`relative flex cursor-pointer flex-col rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-offset-2 ${selected ? 'border-blue-500 ring-1 ring-blue-400 bg-blue-50/40 dark:bg-blue-500/10' : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'}`}
						>
							<input
								type="radio"
								name="wardrobe-visibility"
								value={opt.value}
								checked={selected}
								onChange={() => update(opt.value)}
								className="sr-only"
								aria-checked={selected}
							/>
							<span className="font-medium">{opt.label}</span>
							<span className="mt-1 text-xs text-gray-600 dark:text-gray-400">{opt.desc}</span>
							{selected && (
								<span aria-hidden className="pointer-events-none absolute right-2 top-2 text-blue-600 dark:text-blue-400">✓</span>
							)}
						</label>
					)
				})}
			</div>
			<p className="text-xs text-gray-500 dark:text-gray-400">(Backend persistence & permissions enforcement added in Task 5.2 / 5.3)</p>
		</fieldset>
	)
}

export default WardrobeVisibilitySelector
