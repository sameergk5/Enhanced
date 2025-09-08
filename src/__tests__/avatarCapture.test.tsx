import { describe, expect, it } from 'vitest'
import { buildCapturedAvatarImage } from '../services/avatarCapture'

// jsdom in Vitest may not implement URL.createObjectURL; provide a minimal mock.
if (!('createObjectURL' in URL)) {
	// @ts-expect-error augment for test
	URL.createObjectURL = () => 'blob:mock-url'
}

describe('avatarCapture utility', () => {
	it('wraps blob and produces data URL', async () => {
		const blob = new Blob(['hello'], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const fileName = 'test.txt'
		const cap = buildCapturedAvatarImage({ blob, url, fileName })
		const dataUrl = await cap.toDataUrl()
		expect(dataUrl.startsWith('data:text/plain;base64')).toBe(true)
	})
})
