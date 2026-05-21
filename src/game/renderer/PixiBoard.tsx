'use client'

/**
 * Rendering layer — canvas 2D renderer using Tiny Swords assets.
 * Blue team = allies (rows 2-3), Red team = enemies (rows 0-1).
 * Characters are rendered large enough to be clearly visible.
 */

import { useEffect, useRef, useCallback } from 'react'
import type { BoardGrid, Unit, SelectedSource, UnitAnimState } from '../core/types'
import { COLS, ROWS } from '../systems/boardSystem'
import {
  SPRITE_SHEETS,
  TERRAIN,
  FX,
  getSpriteKey,
  type AnimState,
} from '../assets/spriteRegistry'

// ─── Board dimensions ─────────────────────────────────────────────────────────
// Taller cells so characters are clearly visible
const BOARD_W = 672   // 84 × 8
const BOARD_H = 384   // 96 × 4
const CW = BOARD_W / COLS   // 84px per cell
const CH = BOARD_H / ROWS   // 96px per cell

// Sprite render size — fill most of the cell
const SPRITE_W = 80
const SPRITE_H = 88

// ─── Image cache ──────────────────────────────────────────────────────────────

const imgCache = new Map<string, HTMLImageElement>()

function loadImg(url: string): HTMLImageElement {
  if (imgCache.has(url)) return imgCache.get(url)!
  const img = new Image()
  img.src = url
  imgCache.set(url, img)
  return img
}

function preloadAll() {
  // Units
  for (const sheet of Object.values(SPRITE_SHEETS))
    for (const c of Object.values(sheet.clips)) {
      loadImg(c.url)
      if (c.effectUrl) loadImg(c.effectUrl)
    }
  // Terrain
  Object.values(TERRAIN).forEach(loadImg)
  // FX
  Object.values(FX).forEach(f => loadImg(f.url))
}

// ─── Per-unit animation clock (outside React state for perf) ─────────────────

interface Clock { frame: number; elapsed: number; lastState: string }
const clocks = new Map<number, Clock>()

function getClock(uid: number, state: string): Clock {
  if (!clocks.has(uid)) clocks.set(uid, { frame: 0, elapsed: 0, lastState: state })
  return clocks.get(uid)!
}

function tickClock(clock: Clock, unit: Unit, deltaMs: number): number {
  const animState: AnimState = unit.dead ? 'death'
    : (unit.animState as AnimState) ?? 'idle'

  const key = getSpriteKey(unit.spriteType, unit.enemy)
  const sheet = SPRITE_SHEETS[key]
  if (!sheet) return 0

  const clip = sheet.clips[animState] ?? sheet.clips.idle

  // Reset on state change
  if (clock.lastState !== animState) {
    clock.frame = 0
    clock.elapsed = 0
    clock.lastState = animState
  }

  clock.elapsed += deltaMs
  while (clock.elapsed >= clip.fps) {
    clock.elapsed -= clip.fps
    clock.frame++
    if (clock.frame >= clip.frames) {
      if (clip.loop) clock.frame = 0
      else {
        clock.frame = clip.frames - 1
        unit.animDone = true
        break
      }
    }
  }
  return clock.frame
}

// ─── Arena background ─────────────────────────────────────────────────────────

/**
 * Draw a grass tile background using the tilemap.
 * Tilemap_color1 is 576×384 — a 9×6 grid of 64×64 tiles.
 * We use tile (1,1) = plain grass for ally zone, tile (0,0) = darker for enemy zone.
 */
function drawArena(ctx: CanvasRenderingContext2D) {
  const tilemap = loadImg(TERRAIN.tilemap)
  const TILE = 64

  if (tilemap.complete && tilemap.naturalWidth > 0) {
    // Enemy zone (rows 0-1): darker dirt tile col=0,row=1
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.drawImage(tilemap, 0, TILE, TILE, TILE, c * CW, r * CH, CW, CH)
      }
    }
    // Ally zone (rows 2-3): grass tile col=1,row=0
    for (let r = 2; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.drawImage(tilemap, TILE, 0, TILE, TILE, c * CW, r * CH, CW, CH)
      }
    }
  } else {
    // Fallback solid colors while tilemap loads
    ctx.fillStyle = '#2a1a1a'
    ctx.fillRect(0, 0, BOARD_W, CH * 2)
    ctx.fillStyle = '#1e3a1e'
    ctx.fillRect(0, CH * 2, BOARD_W, CH * 2)
    tilemap.onload = () => {} // will redraw on next frame
  }

  // Zone divider line
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(0, CH * 2, BOARD_W, 2)

  // Decorative rocks on divider
  const rock = loadImg(TERRAIN.rock1)
  if (rock.complete && rock.naturalWidth > 0) {
    const rockPositions = [1, 3, 5, 7]
    rockPositions.forEach(c => {
      ctx.drawImage(rock, 0, 0, 64, 64, c * CW + CW / 2 - 16, CH * 2 - 14, 32, 32)
    })
  }

  // Zone labels
  ctx.save()
  ctx.font = 'bold 10px sans-serif'
  ctx.fillStyle = 'rgba(255,100,100,0.7)'
  ctx.fillText('MUSUH', 6, 14)
  ctx.fillStyle = 'rgba(100,180,255,0.7)'
  ctx.fillText('PASUKANMU', 6, CH * 3 - 4)
  ctx.restore()
}

// ─── Cell highlight ───────────────────────────────────────────────────────────

function drawCellHighlight(
  ctx: CanvasRenderingContext2D,
  r: number, c: number,
  isSelected: boolean,
  isDropTarget: boolean,
) {
  if (isSelected) {
    ctx.fillStyle = 'rgba(100,200,255,0.30)'
    ctx.fillRect(c * CW, r * CH, CW, CH)
    ctx.strokeStyle = 'rgba(100,200,255,0.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(c * CW + 1, r * CH + 1, CW - 2, CH - 2)
  } else if (isDropTarget) {
    ctx.fillStyle = 'rgba(100,255,160,0.15)'
    ctx.fillRect(c * CW, r * CH, CW, CH)
    ctx.strokeStyle = 'rgba(100,255,160,0.4)'
    ctx.lineWidth = 1
    ctx.strokeRect(c * CW + 1, r * CH + 1, CW - 2, CH - 2)
  }
}

// ─── HP bar ───────────────────────────────────────────────────────────────────

function drawHpBar(ctx: CanvasRenderingContext2D, unit: Unit, cx: number, cy: number) {
  const barW = SPRITE_W - 4
  const barH = 5
  const bx = cx - barW / 2
  const by = cy + SPRITE_H / 2 - barH - 1
  const pct = Math.max(0, unit.curHp / unit.maxHp)

  // Background
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(bx, by, barW, barH)

  // Fill
  ctx.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171'
  ctx.fillRect(bx, by, Math.round(barW * pct), barH)

  // Border
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(bx, by, barW, barH)
}

// ─── Stars badge ──────────────────────────────────────────────────────────────

function drawStars(ctx: CanvasRenderingContext2D, stars: number, cx: number, cy: number) {
  if (stars <= 1) return
  ctx.save()
  ctx.font = 'bold 10px sans-serif'
  ctx.fillStyle = '#fbbf24'
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  const txt = '★'.repeat(stars)
  const tw = ctx.measureText(txt).width
  ctx.strokeText(txt, cx - tw / 2, cy - SPRITE_H / 2 + 10)
  ctx.fillText(txt, cx - tw / 2, cy - SPRITE_H / 2 + 10)
  ctx.restore()
}

// ─── Floating damage numbers ──────────────────────────────────────────────────

function drawFloats(ctx: CanvasRenderingContext2D, unit: Unit, cx: number, cy: number) {
  unit.floats = unit.floats.filter(f => {
    ctx.save()
    ctx.globalAlpha = Math.max(0, f.life / 20)
    ctx.font = 'bold 13px sans-serif'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.fillStyle = f.color
    const tx = cx - 10
    const ty = cy - SPRITE_H / 2 - f.rise
    ctx.strokeText(f.txt, tx, ty)
    ctx.fillText(f.txt, tx, ty)
    ctx.restore()
    f.rise += 1.5
    f.life--
    return f.life > 0
  })
}

// ─── Unit sprite ──────────────────────────────────────────────────────────────

function drawUnit(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  frame: number,
  cx: number,
  cy: number,
) {
  const key = getSpriteKey(unit.spriteType, unit.enemy)
  const sheet = SPRITE_SHEETS[key]
  if (!sheet) return

  const animState: AnimState = unit.dead ? 'death'
    : (unit.animState as AnimState) ?? 'idle'
  const clip = sheet.clips[animState] ?? sheet.clips.idle
  const img = loadImg(clip.url)

  const destX = cx - SPRITE_W / 2
  const destY = cy - SPRITE_H / 2

  // Death fade
  if (unit.dead) {
    const progress = clip.frames > 1 ? frame / (clip.frames - 1) : 1
    ctx.globalAlpha = Math.max(0.1, 1 - progress * 0.9)
  }

  if (img.complete && img.naturalWidth > 0) {
    // Allies face right (no flip), enemies face left (flip)
    const flipX = unit.enemy

    ctx.save()
    if (flipX) {
      ctx.translate(cx + SPRITE_W / 2, destY)
      ctx.scale(-1, 1)
      ctx.drawImage(
        img,
        frame * clip.frameW, 0, clip.frameW, clip.frameH,
        0, 0, SPRITE_W, SPRITE_H,
      )
    } else {
      ctx.drawImage(
        img,
        frame * clip.frameW, 0, clip.frameW, clip.frameH,
        destX, destY, SPRITE_W, SPRITE_H,
      )
    }
    ctx.restore()

    // Attack effect overlay
    if (animState === 'attack' && clip.effectUrl) {
      const fxImg = loadImg(clip.effectUrl)
      if (fxImg.complete && fxImg.naturalWidth > 0) {
        const fxW = SPRITE_W * 1.2
        const fxH = SPRITE_H * 1.2
        const fxOffX = unit.enemy ? -SPRITE_W * 0.25 : SPRITE_W * 0.25
        ctx.save()
        ctx.globalAlpha = 0.9
        if (flipX) {
          ctx.translate(cx + SPRITE_W / 2 + fxOffX, destY - SPRITE_H * 0.1)
          ctx.scale(-1, 1)
          ctx.drawImage(fxImg, frame * clip.frameW, 0, clip.frameW, clip.frameH, 0, 0, fxW, fxH)
        } else {
          ctx.drawImage(
            fxImg,
            frame * clip.frameW, 0, clip.frameW, clip.frameH,
            destX + fxOffX, destY - SPRITE_H * 0.1, fxW, fxH,
          )
        }
        ctx.restore()
      }
    }
  } else {
    // Fallback colored rect while loading
    ctx.fillStyle = unit.enemy ? '#7f1d1d' : '#1e3a5f'
    ctx.fillRect(destX + 4, destY + 4, SPRITE_W - 8, SPRITE_H - 8)
  }

  ctx.globalAlpha = 1
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PixiBoardProps {
  board: BoardGrid
  phase: 'prep' | 'battle'
  selected: SelectedSource
  maxBoardSlots: number
  speedUp?: boolean
  onCellClick: (row: number, col: number) => void
}

export default function PixiBoard({
  board,
  phase,
  selected,
  maxBoardSlots,
  speedUp = false,
  onCellClick,
}: PixiBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => { preloadAll() }, [])

  // Clean up clocks for dead/removed units
  useEffect(() => {
    const active = new Set<number>()
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c]) active.add(board[r][c]!.uid)
    for (const uid of clocks.keys())
      if (!active.has(uid)) clocks.delete(uid)
  }, [board])

  const boardUnitCount = (() => {
    let n = 0
    for (let r = 2; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c] && !board[r][c]!.enemy) n++
    return n
  })()

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const deltaMs = lastTimeRef.current
        ? Math.min(timestamp - lastTimeRef.current, 50)
        : 16
      lastTimeRef.current = timestamp

      // Animation clocks run 3× faster during speed-up to match combat
      const animDelta = speedUp ? deltaMs * 3 : deltaMs

      ctx.clearRect(0, 0, BOARD_W, BOARD_H)

      // ── Arena background ──
      drawArena(ctx)

      // ── Speed-up vignette overlay ──
      if (speedUp) {
        ctx.save()
        const grad = ctx.createRadialGradient(
          BOARD_W / 2, BOARD_H / 2, BOARD_H * 0.2,
          BOARD_W / 2, BOARD_H / 2, BOARD_H * 0.8,
        )
        grad.addColorStop(0, 'rgba(255,120,0,0)')
        grad.addColorStop(1, 'rgba(255,80,0,0.18)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, BOARD_W, BOARD_H)
        ctx.restore()
      }

      // ── Grid lines (subtle) ──
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          ctx.strokeRect(c * CW, r * CH, CW, CH)

      // ── Cells + units ──
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const isEnemyZone = r < 2
          const isSelected =
            selected?.src === 'board' &&
            (selected as { src: 'board'; r: number; c: number }).r === r &&
            (selected as { src: 'board'; r: number; c: number }).c === c
          const isDropTarget =
            phase === 'prep' &&
            !isEnemyZone &&
            !isSelected &&
            selected !== null &&
            boardUnitCount < maxBoardSlots &&
            !board[r][c]

          drawCellHighlight(ctx, r, c, isSelected, isDropTarget)

          const u = board[r][c]
          if (!u) continue

          // Cell center
          const cx = c * CW + CW / 2
          const cy = r * CH + CH / 2

          // Tick animation — use animDelta so speed-up is visible
          const clock = getClock(u.uid, u.animState ?? 'idle')
          const frame = tickClock(clock, u, animDelta)

          drawUnit(ctx, u, frame, cx, cy)

          if (!u.dead) {
            drawHpBar(ctx, u, cx, cy)
            drawStars(ctx, u.stars, cx, cy)
          }

          drawFloats(ctx, u, cx, cy)
        }
      }

      // ── Speed-up label ──
      if (speedUp) {
        ctx.save()
        ctx.font = 'bold 11px sans-serif'
        ctx.fillStyle = 'rgba(255,160,40,0.9)'
        ctx.fillText('⚡ 3× SPEED', BOARD_W - 80, 14)
        ctx.restore()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, phase, selected, maxBoardSlots, boardUnitCount, speedUp],
  )

  useEffect(() => {
    let running = true
    function loop(ts: number) {
      if (!running) return
      draw(ts)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [draw])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = BOARD_W / rect.width
      const scaleY = BOARD_H / rect.height
      const mx = (e.clientX - rect.left) * scaleX
      const my = (e.clientY - rect.top) * scaleY
      const col = Math.floor(mx / CW)
      const row = Math.floor(my / CH)
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return
      onCellClick(row, col)
    },
    [onCellClick],
  )

  return (
    <canvas
      ref={canvasRef}
      width={BOARD_W}
      height={BOARD_H}
      onClick={handleClick}
      className="block w-full rounded-lg cursor-pointer"
      style={{ imageRendering: 'pixelated' }}
      aria-label="Game board — klik untuk menempatkan atau memindahkan unit"
    />
  )
}

// ─── Mini preview for shop / bench ───────────────────────────────────────────
// Always renders the IDLE frame — never hurt/death/attack.

export function drawUnitPreview(
  canvas: HTMLCanvasElement,
  unit: { spriteType?: string; body: number[][]; color: string; accent: string; stars: number },
  size = 48,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const key = unit.spriteType ? getSpriteKey(unit.spriteType, false) : null
  if (key && SPRITE_SHEETS[key]) {
    const sheet = SPRITE_SHEETS[key]
    // Always use idle clip for previews
    const clip = sheet.clips.idle
    const img = loadImg(clip.url)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // Draw frame 0 of idle
      ctx.drawImage(img, 0, 0, clip.frameW, clip.frameH, 2, 2, size, size)
      if (unit.stars > 1) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 9px sans-serif'
        ctx.fillText('★'.repeat(unit.stars), 2, 11)
      }
    }

    if (img.complete && img.naturalWidth > 0) draw()
    else img.onload = draw
    return
  }

  // Pixel-art fallback
  const pw = Math.floor(size / 4)
  unit.body.forEach((row, ri) => {
    row.forEach((px, ci) => {
      if (!px) return
      ctx.fillStyle = ri === 0 && (ci === 1 || ci === 2) ? unit.accent : unit.color
      ctx.fillRect(2 + ci * pw, 2 + ri * pw, pw, pw)
    })
  })
}
