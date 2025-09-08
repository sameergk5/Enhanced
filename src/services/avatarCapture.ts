// Avatar Image Capture Utility (Task 5.4)
// Provides helper to convert captured blob to downloadable file or share data URL.

export interface CapturedAvatarImage {
	blob: Blob
	url: string
	fileName: string
	toDataUrl: () => Promise<string>
	download: () => void
}

export function buildCapturedAvatarImage(input: { blob: Blob; url: string; fileName: string }): CapturedAvatarImage {
	return {
		...input,
		async toDataUrl() {
			return new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => resolve(reader.result as string)
				reader.onerror = () => reject(reader.error)
				reader.readAsDataURL(input.blob)
			})
		},
		download() {
			const a = document.createElement('a')
			a.href = input.url
			a.download = input.fileName
			document.body.appendChild(a)
			a.click()
			a.remove()
		}
	}
}
