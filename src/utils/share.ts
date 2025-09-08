// Native sharing utility (Task 5.5)

export interface ShareOptions {
	title?: string
	text?: string
	file?: Blob
	fileName?: string
	url?: string
}

export async function shareLook(opts: ShareOptions) {
	if (!navigator.share) throw new Error('Web Share API not supported')

	// Attempt to include file if supported
	const data: any = {
		title: opts.title || 'My Wardrobe AI Look',
		text: opts.text || 'Check out this outfit I styled in Wardrobe AI!'
	}
	if (opts.url) data.url = opts.url

	if (opts.file && (navigator as any).canShare && (navigator as any).canShare({ files: [new File([opts.file], opts.fileName || 'look.png', { type: opts.file.type })] })) {
		data.files = [new File([opts.file], opts.fileName || 'look.png', { type: opts.file.type })]
	}

	await navigator.share(data)
}
