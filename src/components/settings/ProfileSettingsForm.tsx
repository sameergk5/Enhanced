import React, { useState } from 'react'
import { apiRequest } from '../../services/api'

interface ProfileFormState {
	displayName: string
	bio: string
	isPrivate: boolean
}

interface ProfileSettingsFormProps {
	initial?: Partial<ProfileFormState>
	onSaved?: (data: any) => void
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({ initial, onSaved }) => {
	const [form, setForm] = useState<ProfileFormState>({
		displayName: initial?.displayName || '',
		bio: initial?.bio || '',
		isPrivate: initial?.isPrivate ?? false
	})
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const update = (patch: Partial<ProfileFormState>) => setForm(f => ({ ...f, ...patch }))

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setError(null)
		setMessage(null)
		try {
			const res = await apiRequest('/api/users/profile', {
				method: 'PUT',
				body: JSON.stringify(form)
			})
			setMessage('Profile updated')
			onSaved?.(res)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setSaving(false)
		}
	}

	return (
		<form onSubmit={submit} className="profile-settings-form space-y-4">
			<div className="field">
				<label>Display Name</label>
				<input
					type="text"
					value={form.displayName}
					onChange={e => update({ displayName: e.target.value })}
					maxLength={50}
					required
				/>
			</div>
			<div className="field">
				<label>Bio</label>
				<textarea
					value={form.bio}
					onChange={e => update({ bio: e.target.value })}
					maxLength={500}
					rows={4}
				/>
			</div>
			<div className="field inline">
				<label>
					<input
						type="checkbox"
						checked={form.isPrivate}
						onChange={e => update({ isPrivate: e.target.checked })}
					/>{' '}
					Private Account
				</label>
			</div>
			<div className="actions">
				<button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
			</div>
			{message && <p className="status success">{message}</p>}
			{error && <p className="status error">{error}</p>}
		</form>
	)
}
