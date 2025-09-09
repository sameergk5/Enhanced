import React, { useRef, useState } from 'react'
import AvatarViewer3D from '../components/avatar/AvatarViewer3D'
import { submitCommunityLook } from '../services/communityApi'
import { captureAvatarCanvas } from '../utils/avatarCapture'

// Minimal UI for Task 9.2: Submit a look for anonymous rating
const Community: React.FC = () => {
	const [pending, setPending] = useState(false)
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [status, setStatus] = useState<string | null>(null)
	const avatarContainerRef = useRef<HTMLDivElement | null>(null)

	async function handleCapture() {
		try {
			setStatus(null)
			setPending(true)
			const img = captureAvatarCanvas(avatarContainerRef.current!)
			setImageUrl(img)
			setPending(false)
		} catch (e: any) {
			setStatus(e.message || 'Capture failed')
			setPending(false)
		}
	}

	async function handleSubmit() {
		if (!imageUrl) {
			setStatus('Capture an image first')
			return
		}
		setPending(true)
		try {
			await submitCommunityLook({ avatarImageUrl: imageUrl, lookData: { items: [] } })
			setStatus('Submitted for rating!')
		} catch (e: any) {
			setStatus(e.message || 'Submit failed')
		} finally {
			setPending(false)
		}
	}

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold">Community</h1>
			<p className="text-sm text-gray-500">Submit your current look for anonymous community rating.</p>
			<div className="grid md:grid-cols-2 gap-6">
				<div className="border rounded p-4 space-y-3" ref={avatarContainerRef} data-avatar-root>
					<AvatarViewer3D avatarUrl="/placeholder-avatar.glb" className="w-full h-80" />
				</div>
				<div className="border rounded p-4 space-y-3">
					{imageUrl ? (
						<img src={imageUrl} alt="Preview" className="w-full rounded" />
					) : (
						<div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded">No capture yet</div>
					)}
					<div className="flex gap-3">
						<button onClick={handleCapture} disabled={pending} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Capture</button>
						<button onClick={handleSubmit} disabled={pending || !imageUrl} className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50">Submit for Rating</button>
					</div>
					{status && <div className="text-sm text-gray-600">{status}</div>}
				</div>
			</div>
		</div>
	)
}

export default Community
