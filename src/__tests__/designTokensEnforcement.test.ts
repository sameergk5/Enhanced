import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

// Directories to scan for stray hex literals (excluding theme definition & allowed brand component)
const COMPONENTS_DIR = path.join(__dirname, '..', 'components')
const ALLOWLIST_FILES = ['GoogleSignInButton.tsx']
const HEX_REGEX = /#[0-9a-fA-F]{3,6}\b/g

const collectFiles = (dir: string): string[] => {
	return fs.readdirSync(dir).flatMap(entry => {
		const full = path.join(dir, entry)
		const stat = fs.statSync(full)
		if (stat.isDirectory()) return collectFiles(full)
		if (full.endsWith('.tsx') || full.endsWith('.ts') || full.endsWith('.jsx') || full.endsWith('.js')) return [full]
		return []
	})
}

describe('Design Tokens Enforcement', () => {
	it('has no stray hard-coded hex colors in component source (except allowlisted)', () => {
		const files = collectFiles(COMPONENTS_DIR)
		const violations: { file: string; matches: string[] }[] = []
		for (const file of files) {
			if (ALLOWLIST_FILES.some(name => file.endsWith(name))) continue
			const content = fs.readFileSync(file, 'utf8')
			const matches = content.match(HEX_REGEX) || []
			// Ignore hash in comments referencing docs or variable definitions like #FFFFFF inside a CSS var string? -> filter if part of '--color-' line (CSS var mapping handled elsewhere)
			const filtered = matches.filter(m => !content.includes('--color-primary') || !m)
			if (filtered.length > 0) {
				violations.push({ file: path.relative(process.cwd(), file), matches: filtered })
			}
		}
		if (violations.length > 0) {
			console.error('Found hard-coded hex colors:', JSON.stringify(violations, null, 2))
		}
		expect(violations).toHaveLength(0)
	})
})
