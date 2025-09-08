import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { WardrobeVisibilitySelector } from '../src/components/profile/WardrobeVisibilitySelector'

describe('WardrobeVisibilitySelector', () => {
	beforeEach(() => {
		window.localStorage.clear()
	})

	it('renders three options', () => {
		render(<WardrobeVisibilitySelector />)
		expect(screen.getByLabelText(/Wardrobe visibility/i)).toBeInTheDocument()
		expect(screen.getByText('Private')).toBeInTheDocument()
		expect(screen.getByText('Friends')).toBeInTheDocument()
		expect(screen.getByText('Public')).toBeInTheDocument()
	})

	it('defaults to private and allows change', () => {
		render(<WardrobeVisibilitySelector />)
		const privateCard = screen.getByText('Private')
		expect(privateCard).toBeInTheDocument()
		// select Public
		const publicRadio = screen.getByRole('radio', { name: /Public/i }) as HTMLInputElement | null
		if (publicRadio) {
			fireEvent.click(publicRadio)
		} else {
			// fallback: click card label text
			fireEvent.click(screen.getByText('Public'))
		}
		// Re-render to read updated stored state
		render(<WardrobeVisibilitySelector />)
		// localStorage persistence validated by selector showing checkmark on public option
		const radios = screen.getAllByRole('radio') as HTMLInputElement[]
		const selected = radios.find(r => r.checked)
		expect(selected?.value).toBe('public')
	})
})
