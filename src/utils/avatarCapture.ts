// Client-side avatar / canvas capture utilities (Task 5.4)

export interface CaptureOptions {
	mimeType?: string
	quality?: number
	fileName?: string
}

export async function captureElementAsImage(el: HTMLElement, opts: CaptureOptions = {}): Promise<Blob> {
	const mimeType = opts.mimeType || 'image/png'
	// Use html2canvas if available; fallback to toDataURL on contained canvas
	// @ts-ignore
	if (window.html2canvas) {
		// @ts-ignore
		const canvas = await window.html2canvas(el, { backgroundColor: null })
		return await new Promise<Blob>((resolve) => canvas.toBlob((b: Blob | null) => resolve(b!), mimeType, opts.quality))
	}
	const canvas: HTMLCanvasElement | null = el.querySelector('canvas')
	if (!canvas) throw new Error('No canvas found for capture')
	return await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas capture failed')), mimeType, opts.quality)
	})
}

export function downloadBlob(blob: Blob, fileName = 'avatar-look.png') {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = fileName
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

export async function captureAndDownload(el: HTMLElement, opts: CaptureOptions = {}) {
	const blob = await captureElementAsImage(el, opts)
	downloadBlob(blob, opts.fileName || 'avatar-look.png')
	return blob
}
