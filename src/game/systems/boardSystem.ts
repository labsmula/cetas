// Board placement logic — pure functions
import type { BoardGrid, BenchSlots, Unit, SelectedSource } from '../core/types'

export const COLS = 8
export const ROWS = 8
export const ENEMY_ROWS = 4   // rows 0–3
export const ALLY_ROW_START = 4  // rows 4–7

/** Rows reserved for buildings — no units can be placed or spawned here */
export const BUILDING_ROWS = new Set([0, 7])

/** Is this cell blocked by a building? */
export function isBuildingCell(row: number): boolean {
  return BUILDING_ROWS.has(row)
}

/** Count player-owned units on the board (rows 4–7) */
export function getBoardUnitCount(board: BoardGrid): number {
  let n = 0
  for (let r = ALLY_ROW_START; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c] && !board[r][c]!.enemy) n++
  return n
}

export function emptyBoard(): BoardGrid {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
}

export function getAllUnits(board: BoardGrid): { u: Unit; r: number; c: number }[] {
  const all: { u: Unit; r: number; c: number }[] = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c]) all.push({ u: board[r][c]!, r, c })
  return all
}

export interface PlacementResult {
  board: BoardGrid
  bench: BenchSlots
  selected: SelectedSource
  log?: string
  error?: string
}

/** Move a selected unit to a board cell */
export function placeOnBoard(
  board: BoardGrid,
  bench: BenchSlots,
  selected: SelectedSource,
  targetRow: number,
  targetCol: number,
  maxBoardSlots: number,
): PlacementResult {
  if (!selected) return { board, bench, selected: null }

  const b: BoardGrid = board.map(row => [...row])
  const bch: BenchSlots = [...bench]

  let unit: Unit | null = null
  if (selected.src === 'bench') {
    unit = bch[selected.idx]
    bch[selected.idx] = null
  } else {
    unit = b[selected.r][selected.c]
    b[selected.r][selected.c] = null
  }

  if (!unit) return { board, bench, selected: null }

  // Block placement on building rows (row 0 = enemy castle, row 7 = ally castle)
  if (isBuildingCell(targetRow)) {
    if (selected.src === 'bench') bch[selected.idx] = unit
    else b[selected.r][selected.c] = unit
    return {
      board: b, bench: bch, selected: null,
      error: '🏰 Cannot place units on building tiles!',
    }
  }

  const existing = b[targetRow][targetCol]

  if (existing && !existing.enemy) {
    // Swap: put existing back to source
    if (selected.src === 'bench') bch[selected.idx] = existing
    else b[selected.r][selected.c] = existing
  } else if (!existing) {
    // Check slot limit when coming from bench
    const currentCount = getBoardUnitCount(b)
    if (selected.src === 'bench' && currentCount >= maxBoardSlots) {
      bch[selected.idx] = unit
      return {
        board: b, bench: bch, selected: null,
        error: `⚠️ Board full! Maximum ${maxBoardSlots} units allowed.`,
      }
    }
  }

  b[targetRow][targetCol] = unit
  return {
    board: b, bench: bch, selected: null,
    log: `📍 ${unit.name} placed`,
  }
}

/** Move a selected unit to a bench slot */
export function placeOnBench(
  board: BoardGrid,
  bench: BenchSlots,
  selected: SelectedSource,
  targetIdx: number,
): PlacementResult {
  if (!selected) return { board, bench, selected: null }

  const b: BoardGrid = board.map(row => [...row])
  const bch: BenchSlots = [...bench]

  let unit: Unit | null = null
  if (selected.src === 'bench') {
    unit = bch[selected.idx]
    bch[selected.idx] = null
  } else {
    unit = b[selected.r][selected.c]
    b[selected.r][selected.c] = null
  }

  if (!unit) return { board, bench, selected: null }

  const existing = bch[targetIdx]
  bch[targetIdx] = unit
  if (existing) {
    if (selected.src === 'board') b[selected.r][selected.c] = existing
    else bch[selected.idx] = existing
  }

  return { board: b, bench: bch, selected: null }
}
