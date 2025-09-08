/**
 * Base API service for making authenticated requests to the backend
 */

const API_BASE_URL = process.env.NODE_ENV === 'production'
	? 'https://your-production-api.com'
	: 'http://localhost:3001'

export interface ApiError extends Error {
	status?: number
	code?: string
}

export interface ApiRequestOptions extends RequestInit {
	authenticated?: boolean
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
	endpoint: string,
	options: ApiRequestOptions = {}
): Promise<T> {
	const { authenticated = true, ...fetchOptions } = options

	// Build full URL
	const url = endpoint.startsWith('http')
		? endpoint
		: `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

	// Prepare headers
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	}

	// Add authentication if required
	if (authenticated) {
		const token = localStorage.getItem('token')
		if (token) {
			headers['Authorization'] = `Bearer ${token}`
		}
	}

	// Make request
	try {
		const response = await fetch(url, {
			...fetchOptions,
			headers
		})

		// Handle non-JSON responses
		const contentType = response.headers.get('content-type')
		const isJson = contentType?.includes('application/json')

		let data: any
		if (isJson) {
			data = await response.json()
		} else {
			data = await response.text()
		}

		// Handle HTTP errors
		if (!response.ok) {
			const error = new Error(
				data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`
			) as ApiError

			error.status = response.status
			error.code = data?.code

			throw error
		}

		return data
	} catch (error) {
		// Network or other errors
		if (error instanceof TypeError && error.message.includes('fetch')) {
			throw new Error('Network error. Please check your connection.')
		}

		throw error
	}
}

/**
 * Upload a file with progress tracking
 */
export async function uploadFile(
	endpoint: string,
	file: File,
	additionalData: Record<string, any> = {},
	onProgress?: (progress: number) => void
): Promise<any> {
	return new Promise((resolve, reject) => {
		const formData = new FormData()
		formData.append('file', file)

		// Add additional form data
		Object.entries(additionalData).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					formData.append(key, value.join(','))
				} else {
					formData.append(key, String(value))
				}
			}
		})

		const xhr = new XMLHttpRequest()

		// Track upload progress
		if (onProgress) {
			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					const progress = (event.loaded / event.total) * 100
					onProgress(progress)
				}
			})
		}

		// Handle completion
		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const response = JSON.parse(xhr.responseText)
					resolve(response)
				} catch (error) {
					resolve(xhr.responseText)
				}
			} else {
				try {
					const error = JSON.parse(xhr.responseText)
					reject(new Error(error.error || error.message || `Upload failed: ${xhr.status}`))
				} catch {
					reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
				}
			}
		})

		// Handle network errors
		xhr.addEventListener('error', () => {
			reject(new Error('Network error during upload'))
		})

		// Start upload
		const url = endpoint.startsWith('http')
			? endpoint
			: `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

		xhr.open('POST', url)

		// Add authentication header
		const token = localStorage.getItem('token')
		if (token) {
			xhr.setRequestHeader('Authorization', `Bearer ${token}`)
		}

		xhr.send(formData)
	})
}

/**
 * Download a file
 */
export async function downloadFile(
	endpoint: string,
	filename?: string
): Promise<void> {
	try {
		const response = await fetch(
			endpoint.startsWith('http')
				? endpoint
				: `${API_BASE_URL}${endpoint}`,
			{
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			}
		)

		if (!response.ok) {
			throw new Error(`Download failed: ${response.status}`)
		}

		const blob = await response.blob()

		// Create download link
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename || 'download'
		document.body.appendChild(a)
		a.click()

		// Cleanup
		window.URL.revokeObjectURL(url)
		document.body.removeChild(a)
	} catch (error) {
		console.error('Download error:', error)
		throw error
	}
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	return !!localStorage.getItem('token')
}

/**
 * Get current user token
 */
export function getAuthToken(): string | null {
	return localStorage.getItem('token')
}

/**
 * Clear authentication
 */
export function clearAuth(): void {
	localStorage.removeItem('token')
	localStorage.removeItem('user')
}

/**
 * Helper for handling API errors in components
 */
export function handleApiError(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	}

	if (typeof error === 'string') {
		return error
	}

	return 'An unexpected error occurred'
}

export default {
	apiRequest,
	uploadFile,
	downloadFile,
	isAuthenticated,
	getAuthToken,
	clearAuth,
	handleApiError
}
