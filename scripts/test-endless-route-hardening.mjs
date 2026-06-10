import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const source = readFileSync(new URL('../app/api/player/endless/route.ts', import.meta.url), 'utf8')

// Check that grantCetasReward is NOT imported or called (comments mentioning it are fine)
const codeLines = source.split('\n').filter(l => !l.trimStart().startsWith('//') && !l.trimStart().startsWith('*'))
const codeText = codeLines.join('\n')

assert(!codeText.includes('grantCetasReward'), 'endless endpoint must not import or call grantCetasReward')
assert(source.includes('checkEndlessRateLimit'), 'endless endpoint should run a local wallet/IP rate limit before mutating progress')
assert(source.includes("status: 'disabled'"), 'endless response should mark on-chain rewards disabled without server-authoritative proof')

console.log('✓ endless route hardening checks passed')
