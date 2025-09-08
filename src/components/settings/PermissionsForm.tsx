import React, { useEffect, useState } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { WardrobePermissions } from '../../services/permissions'

type PermissionKey = keyof WardrobePermissions

interface PermToggleDef {
	key: PermissionKey
	label: string
	desc: string
}

const PERM_TOGGLES: PermToggleDef[] = [
	{ key: 'shareWardrobePublic', label: 'Public Wardrobe', desc: 'Allow anyone to view your wardrobe items.' },
	{ key: 'allowOutfitSharing', label: 'Outfit Sharing', desc: 'Enable sharing generated outfits externally.' },
	{ key: 'allowAvatarDownloads', label: 'Avatar Downloads', desc: 'Allow downloading rendered avatar images.' },
	{ key: 'allowLookRating', label: 'Community Look Rating', desc: 'Permit others to rate your submitted looks.' },
	{ key: 'allowAnonymousViews', label: 'Anonymous Views', desc: 'Allow non-logged-in users to view shared content.' }
]

export const PermissionsForm: React.FC = () => {
	const { permissions, loading, saving, error, save } = usePermissions()
	const [local, setLocal] = useState(permissions)
	const [status, setStatus] = useState<string | null>(null)

	useEffect(() => {
		if (permissions) setLocal(permissions)
	}, [permissions])

	if (loading && !local) return <div>Loading permissions...</div>
	if (error) return <div className="status error">{error}</div>
	if (!local) return null

	const update = (k: PermissionKey, v: any) => setLocal(p => p ? { ...p, [k]: v } : p)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setStatus(null)
		await save(local)
		setStatus('Permissions saved')
	}

	return (
		<form onSubmit={submit} className="permissions-form space-y-4">
			<div className="toggle-grid">
				{PERM_TOGGLES.map(t => (
					<label key={t.key} className="perm-toggle">
						<input
							type="checkbox"
							checked={!!local[t.key]}
							onChange={e => update(t.key, e.target.checked)}
						/>
						<span className="label">
							<strong>{t.label}</strong>
							<span className="desc">{t.desc}</span>
						</span>
					</label>
				))}
			</div>
			<div className="actions">
				<button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Permissions'}</button>
			</div>
			{status && <p className="status success">{status}</p>}
		</form>
	)
}
