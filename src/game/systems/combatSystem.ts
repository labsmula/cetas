// Combat simulation — pure logic, no rendering
import { UNIT_DEFS } from '../entities/unitDefs'
import { makeUnit } from '../core/unitFactory'
import type { BoardGrid, EnemyPreview } from '../core/types'
import { COLS, getAllUnits } from './boardSystem'

/** Generate enemy preview list for a given round (deterministic-ish, used in prep phase) */
export function generateEnemyPreview(round: number, maxBoardSlots: number): EnemyPreview[] {
  const maxEnemy = Math.min(maxBoardSlots + 1, 6)
  const count = Math.min(2 + round, maxEnemy)
  const tier = Math.min(Math.floor(round / 2), 2)
  const pool = UNIT_DEFS.filter(u => u.cost <= 1 + tier)
  const previews: EnemyPreview[] = []

  // Use a seeded-ish approach: pick evenly from pool for preview
  for (let i = 0; i < count; i++) {
    const def = pool[i % pool.length]
    const stars: 1 | 2 = round >= 4 && i % 3 === 0 ? 2 : 1
    const m = stars === 2 ? 1.8 : 1
    previews.push({
      id: def.id,
      name: def.name,
      stars,
      atk: Math.round(def.atk * m),
      hp: Math.round(def.hp * m),
      spd: def.spd,
      avatarIndex: def.avatarIndex,
      traitLabel: def.traitLabel,
    })
  }
  return previews
}

/** Populate enemy rows (0–1) with scaled enemies for the given round */
export function generateEnemies(board: BoardGrid, round: number, maxBoardSlots: number): BoardGrid {
  const b: BoardGrid = board.map(row => [...row])
  // Clear enemy rows
  for (let r = 0; r < 2; r++) for (let c = 0; c < COLS; c++) b[r][c] = null

  const maxEnemy = Math.min(maxBoardSlots + 1, 6)
  const count = Math.min(2 + round, maxEnemy)
  const tier = Math.min(Math.floor(round / 2), 2)
  const pool = UNIT_DEFS.filter(u => u.cost <= 1 + tier)

  for (let i = 0; i < count; i++) {
    const def = pool[Math.floor(Math.random() * pool.length)]
    const stars: 1 | 2 = round >= 4 && Math.random() < 0.35 ? 2 : 1
    let placed = false
    for (let attempt = 0; attempt < 20 && !placed; attempt++) {
      const r = Math.floor(Math.random() * 2)
      const c = Math.floor(Math.random() * COLS)
      if (!b[r][c]) {
        b[r][c] = makeUnit(def, stars, true)
        placed = true
      }
    }
  }
  return b
}

export interface BattleStepResult {
  board: BoardGrid
  /** false when one side is wiped out */
  ongoing: boolean
}

/** Run one tick of combat — mutates unit state in-place for performance.
 *  deltaMs: real elapsed ms (used for time-based attack pacing).
 *  speedMult: 1 = normal, 3 = speed-up mode.
 */
export function runBattleStep(board: BoardGrid, deltaMs = 16, speedMult = 1): BattleStepResult {
  const all = getAllUnits(board)
  const alive = all.filter(x => !x.u.dead)
  const allies = alive.filter(x => !x.u.enemy)
  const enemies = alive.filter(x => x.u.enemy)

  if (!allies.length || !enemies.length) return { board, ongoing: false }

  // Effective time advance — speed-up multiplies perceived time
  const effectiveDelta = deltaMs * speedMult

  // Tick animation state machine for each unit
  alive.forEach(x => {
    const u = x.u
    // Legacy bob (used as fallback)
    u.anim += u.animDir
    if (u.anim > 20 || u.anim < 0) u.animDir *= -1

    // If attack anim finished, return to idle
    if (u.animState === 'attack' && u.animDone) {
      u.animState = 'idle'
      u.animFrame = 0
      u.animElapsed = 0
      u.animDone = false
    }
    // If hurt anim finished, return to idle
    if (u.animState === 'hurt' && u.animDone) {
      u.animState = 'idle'
      u.animFrame = 0
      u.animElapsed = 0
      u.animDone = false
    }
    // Idle units that aren't attacking/hurting
    if (u.animState !== 'attack' && u.animState !== 'hurt' && u.animState !== 'death') {
      u.animState = 'idle'
    }
  })

  // Attack pacing: spd is attacks-per-second.
  // attackTimer accumulates seconds; fires when >= 1.
  const secondsElapsed = effectiveDelta / 1000
  alive.forEach(x => {
    x.u.attackTimer += x.u.spd * secondsElapsed
    if (x.u.attackTimer < 1) return
    x.u.attackTimer -= 1

    const targets = x.u.enemy ? allies : enemies
    if (!targets.length) return

    const t = targets[Math.floor(Math.random() * targets.length)]
    const dmg = Math.max(1, x.u.atkVal + ((Math.random() * 8 | 0) - 4))
    t.u.curHp = Math.max(0, t.u.curHp - dmg)
    t.u.shake = 4

    // Trigger attack animation on attacker
    x.u.animState = 'attack'
    x.u.animFrame = 0
    x.u.animElapsed = 0
    x.u.animDone = false

    // Trigger hurt animation on target (unless dying)
    if (t.u.curHp > 0) {
      t.u.animState = 'hurt'
      t.u.animFrame = 0
      t.u.animElapsed = 0
      t.u.animDone = false
    }

    t.u.floats.push({
      txt: `-${dmg}`,
      rise: 0,
      life: 20,
      color: t.u.enemy ? '#F0997B' : '#E24B4A',
    })

    if (t.u.curHp <= 0) {
      t.u.dead = true
      t.u.animState = 'death'
      t.u.animFrame = 0
      t.u.animElapsed = 0
      t.u.animDone = false
    }
  })

  return { board, ongoing: true }
}

export interface BattleEndResult {
  win: boolean
  goldEarned: number
  hpLost: number
  slotsGained: number
  aliveCount: number
  enemiesAlive: number
}

export function evaluateBattleEnd(board: BoardGrid, round: number): BattleEndResult {
  const all = getAllUnits(board)
  const alliesAlive = all.filter(x => !x.u.enemy && !x.u.dead)
  const enemiesAlive = all.filter(x => x.u.enemy && !x.u.dead)
  const win = enemiesAlive.length === 0

  return {
    win,
    goldEarned: win ? 3 + round : 0,
    hpLost: win ? 0 : 10 + enemiesAlive.length * 6,
    slotsGained: win ? 1 : 0,
    aliveCount: alliesAlive.length,
    enemiesAlive: enemiesAlive.length,
  }
}
