// Avatar sharing service (Task 5.5)
// Attempts to use Web Share API (Level 2) with file; falls back to download/data URL strategy.

import type { CapturedAvatarImage } from './avatarCapture'

export interface ShareOptions {
	title?: string
	text?: string
}

export interface ShareResult {
	method: 'native' | 'fallback'
	error?: string
}

export async function shareCapturedAvatar(image: CapturedAvatarImage, opts: ShareOptions = {}): Promise<ShareResult> {
	try {
		if (typeof navigator !== 'undefined' && (navigator as any).share) {
			const nav: any = navigator
			const file = new File([image.blob], image.fileName, { type: image.blob.type || 'image/png' })
			if (nav.canShare && !nav.canShare({ files: [file] })) {
				return { method: 'fallback' }
			}
			await nav.share({ title: opts.title || 'My Outfit', text: opts.text || 'Check out this look!', files: [file] })
			return { method: 'native' }
		}
		return { method: 'fallback' }
	} catch (e: any) {
		return { method: 'fallback', error: e?.message || 'Share failed' }
	}
}
