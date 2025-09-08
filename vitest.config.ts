import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './vitest.setup.ts',
		include: [
			'**/src/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)',
			'**/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)'
		]
	}
})
