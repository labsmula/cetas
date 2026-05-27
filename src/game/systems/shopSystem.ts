// Shop logic — pure functions, no rendering, no React
import { UNIT_DEFS } from '../entities/unitDefs'
import { makeUnit } from '../core/unitFactory'
import { ALLY_ROW_START } from './boardSystem'
import type { ShopItem, BenchSlots, Unit, BoardGrid } from '../core/types'

export function generateShop(): ShopItem[] {
  const pool = [...UNIT_DEFS, ...UNIT_DEFS, ...UNIT_DEFS]
  const shop: ShopItem[] = []
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    const def = pool.splice(idx, 1)[0]
    shop.push({ ...def, sold: false })
  }
  return shop
}

export interface MergeResult {
  bench: BenchSlots
  mergeLog: string[]
}

export interface FormationMergeResult extends MergeResult {
  board: BoardGrid
}

type UnitRef =
  | { src: 'board'; r: number; c: number; unit: Unit }
  | { src: 'bench'; idx: number; unit: Unit }

function collectMergeRefs(board: BoardGrid, bench: BenchSlots): UnitRef[] {
  const refs: UnitRef[] = []

  board.forEach((row, r) => {
    if (r < ALLY_ROW_START) return
    row.forEach((unit, c) => {
      if (unit && !unit.enemy) refs.push({ src: 'board', r, c, unit })
    })
  })

  bench.forEach((unit, idx) => {
    if (unit && !unit.enemy) refs.push({ src: 'bench', idx, unit })
  })

  return refs
}

function clearRef(board: BoardGrid, bench: BenchSlots, ref: UnitRef) {
  if (ref.src === 'board') board[ref.r][ref.c] = null
  else bench[ref.idx] = null
}

function placeMergedUnit(board: BoardGrid, bench: BenchSlots, target: UnitRef, unit: Unit) {
  if (target.src === 'board') {
    board[target.r][target.c] = unit
    return
  }

  const free = bench.indexOf(null)
  bench[free >= 0 ? free : target.idx] = unit
}

/**
 * Recursively merge 3-of-a-kind across the active formation.
 * Board units are counted too, so deployed troops can upgrade immediately.
 */
export function checkFormationMerge(board: BoardGrid, bench: BenchSlots): FormationMergeResult {
  const mergeLog: string[] = []
  let changed = true

  // Work on a mutable copy
  const bd: BoardGrid = board.map(row => [...row])
  const b: BenchSlots = [...bench]

  while (changed) {
    changed = false
    const counts: Record<string, { idxs: number[]; unit: Unit }> = {}
    const refs = collectMergeRefs(bd, b)

    refs.forEach((ref, i) => {
      const key = `${ref.unit.id}_${ref.unit.stars}`
      if (!counts[key]) counts[key] = { idxs: [], unit: ref.unit }
      counts[key].idxs.push(i)
    })

    for (const key in counts) {
      const { idxs, unit } = counts[key]
      if (idxs.length >= 3 && unit.stars < 3) {
        const newStars = (unit.stars + 1) as 1 | 2 | 3
        const def = UNIT_DEFS.find(d => d.id === unit.id)
        if (!def) continue
        const newUnit = makeUnit(def, newStars)

        const mergedRefs = idxs.slice(0, 3).map(i => refs[i])
        const target = mergedRefs.find(ref => ref.src === 'board') ?? mergedRefs[0]

        mergedRefs.forEach(ref => clearRef(bd, b, ref))
        placeMergedUnit(bd, b, target, newUnit)

        mergeLog.push(`Merged! ${unit.name} [${newStars}★] appeared!`)
        changed = true
        break
      }
    }
  }

  return { board: bd, bench: b, mergeLog }
}

/** Recursively check for 3-of-a-kind on bench and merge them */
export function checkMerge(bench: BenchSlots): MergeResult {
  const { bench: mergedBench, mergeLog } = checkFormationMerge([], bench)
  return { bench: mergedBench, mergeLog }
}

export interface BuyResult {
  bench: BenchSlots
  gold: number
  shopItem: ShopItem
  log: string
  error?: string
}

export function buyUnit(
  shopItem: ShopItem,
  bench: BenchSlots,
  gold: number,
): BuyResult {
  if (shopItem.sold) return { bench, gold, shopItem, log: '', error: 'Already sold' }
  if (gold < shopItem.cost) return { bench, gold, shopItem, log: '', error: 'Not enough gold!' }

  const free = bench.indexOf(null)
  if (free < 0) return { bench, gold, shopItem, log: '', error: 'Bench is full! Sell a unit first.' }

  const def = UNIT_DEFS.find(d => d.id === shopItem.id)!
  const newBench = [...bench]
  newBench[free] = makeUnit(def)

  return {
    bench: newBench,
    gold: gold - shopItem.cost,
    shopItem: { ...shopItem, sold: true },
    log: `Recruited ${shopItem.name} -${shopItem.cost}g`,
  }
}
