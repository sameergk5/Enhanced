import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WardrobeVisibilitySelector from '../components/profile/WardrobeVisibilitySelector'

describe('WardrobeVisibilitySelector backend integration', () => {
	const user = userEvent.setup()

	beforeEach(() => {
		vi.resetAllMocks()
		// @ts-ignore
		global.fetch = vi.fn((url: RequestInfo, opts?: RequestInit) => {
			if (opts && opts.method === 'PUT') {
				return Promise.resolve(new Response(JSON.stringify({ visibility: JSON.parse(opts.body as string).visibility }), { status: 200 }))
			}
			return Promise.resolve(new Response(JSON.stringify({ visibility: 'friends' }), { status: 200 }))
		})
	})

	it('loads backend visibility then allows update', async () => {
		render(<WardrobeVisibilitySelector />)

		// initial options present
		const friends = await screen.findByLabelText(/Friends/i)
		// After fetch, friends should be selected
		await waitFor(() => expect((friends as HTMLInputElement).checked).toBe(true))

		const publicOpt = screen.getByLabelText(/Public/i)
		await user.click(publicOpt)

		// update fetch called
		expect(fetch).toHaveBeenCalledWith('/api/visibility', expect.objectContaining({ method: 'PUT' }))
	})
})
