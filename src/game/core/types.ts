// Shared types used across all layers

export type GamePhase = 'prep' | 'battle'

export interface FloatText {
  txt: string
  rise: number
  life: number
  color: string
}

export type UnitAnimState = 'idle' | 'walk' | 'attack' | 'hurt' | 'death'

/** A live unit instance on the board or bench */
export interface Unit {
  uid: number
  id: string
  name: string
  cost: number
  stars: number
  enemy: boolean
  trait: string
  spriteType: string
  avatarIndex: string
  traitLabel: string
  maxHp: number
  curHp: number
  atkVal: number
  spd: number
  color: string
  accent: string
  body: number[][]
  animState: UnitAnimState
  animFrame: number
  animElapsed: number
  animDone: boolean
  anim: number
  animDir: number
  shake: number
  attackTimer: number
  dead: boolean
  floats: FloatText[]
}

export interface GridPosition {
  row: number
  col: number
}

export type BoardGrid = (Unit | null)[][]
export type BenchSlots = (Unit | null)[]

export interface ShopItem {
  id: string
  name: string
  cost: number
  atk: number
  hp: number
  spd: number
  color: string
  accent: string
  trait: string
  traitLabel: string
  spriteType: string
  avatarIndex: string
  body: number[][]
  sold: boolean
}

/** Lightweight enemy preview for the intel panel — no animation state */
export interface EnemyPreview {
  id: string
  name: string
  stars: 1 | 2 | 3
  atk: number
  hp: number
  spd: number
  avatarIndex: string
  traitLabel: string
}

export type SelectedSource =
  | { src: 'board'; r: number; c: number }
  | { src: 'bench'; idx: number }
  | null

export interface GameState {
  round: number
  hp: number
  gold: number
  phase: GamePhase
  maxBoardSlots: number
  board: BoardGrid
  bench: BenchSlots
  shop: ShopItem[]
  selected: SelectedSource
  battleRunning: boolean
  battleTimeMs: number
  speedUp: boolean
  /** Enemy lineup visible during prep phase */
  enemyPreview: EnemyPreview[]
  log: string[]
}
