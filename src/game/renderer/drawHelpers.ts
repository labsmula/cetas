import type { Projectile, Unit } from '../core/types'
import { ARROW_SPRITES, BUILDINGS, SPRITE_SHEETS, TERRAIN, getSpriteKey, type AnimState } from '../assets/spriteRegistry'
import { loadImg } from './assetLoader'

/**
 * Draw a kingdom backdrop for one team.
 * team='red'  → drawn at top (enemy), smaller scale (far perspective)
 * team='blue' → drawn at bottom (ally), larger scale (near perspective)
 * zoneTop = y pixel where this team's zone starts
 */
function drawKingdom(
  ctx: CanvasRenderingContext2D,
  team: 'red' | 'blue',
  boardW: number,
  cw: number,
  ch: number,
  zoneTop: number,
) {
  const b = BUILDINGS[team]

  // Perspective scale: enemy (far) = 0.55×, ally (near) = 0.85×
  const scale    = team === 'red' ? 0.55 : 0.85
  const castleW  = Math.round(cw * 2.2 * scale)
  const castleH  = Math.round(ch * 2.8 * scale)
  const towerW   = Math.round(cw * 1.1 * scale)
  const towerH   = Math.round(ch * 2.2 * scale)
  const houseW   = Math.round(cw * 0.9 * scale)
  const houseH   = Math.round(ch * 1.6 * scale)

  // Y anchor: buildings sit at the zone boundary
  // Red (top): buildings hang down from top edge, partially clipped
  // Blue (bottom): buildings rise up from bottom, partially clipped
  const castleY = team === 'red'
    ? zoneTop - castleH * 0.15
    : zoneTop + ch * 4 - castleH * 0.85

  const towerY = team === 'red'
    ? zoneTop - towerH * 0.1
    : zoneTop + ch * 4 - towerH * 0.8

  const houseY = team === 'red'
    ? zoneTop - houseH * 0.05
    : zoneTop + ch * 4 - houseH * 0.75

  ctx.save()
  ctx.globalAlpha = team === 'red' ? 0.72 : 0.78

  // Helper to draw one building image
  const draw = (url: string, x: number, y: number, w: number, h: number) => {
    const img = loadImg(url)
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x, y, w, h)
    }
  }

  // Layout (left → right):
  // [house] [tower] [barracks] [CASTLE] [barracks] [tower] [house]
  const cx = boardW / 2

  // Castle — center
  draw(b.castle,   cx - castleW / 2,                    castleY,  castleW, castleH)

  // Towers — flanking castle
  draw(b.tower,    cx - castleW / 2 - towerW - cw * 0.1 * scale, towerY,  towerW, towerH)
  draw(b.tower,    cx + castleW / 2 + cw * 0.1 * scale,           towerY,  towerW, towerH)

  // Barracks — outside towers
  draw(b.barracks, cx - castleW / 2 - towerW * 2 - cw * 0.25 * scale, houseY, houseW, houseH)
  draw(b.barracks, cx + castleW / 2 + towerW + cw * 0.15 * scale,      houseY, houseW, houseH)

  // Houses — far edges
  draw(b.house1,   cw * 0.1 * scale,                    houseY,  houseW, houseH)
  draw(b.house2,   boardW - houseW - cw * 0.1 * scale,  houseY,  houseW, houseH)

  ctx.restore()
}

export function drawArena(
  ctx: CanvasRenderingContext2D,
  opts: { cols: number; rows: number; cw: number; ch: number; boardW: number; tileSize: number }
) {
  const { cols, rows, cw, ch, boardW } = opts
  const boardH = rows * ch
  const divY   = ch * 4   // divider between row 3 (enemy) and row 4 (ally)

  // ── Zone backgrounds ──────────────────────────────────────────────────────

  // Enemy zone (rows 0–3): dark crimson earth
  const enemyGrad = ctx.createLinearGradient(0, 0, 0, divY)
  enemyGrad.addColorStop(0,   '#180808')
  enemyGrad.addColorStop(0.5, '#2a1010')
  enemyGrad.addColorStop(1,   '#3a1808')
  ctx.fillStyle = enemyGrad
  ctx.fillRect(0, 0, boardW, divY)

  // Ally zone (rows 4–7): deep forest green
  const allyGrad = ctx.createLinearGradient(0, divY, 0, boardH)
  allyGrad.addColorStop(0,   '#081808')
  allyGrad.addColorStop(0.5, '#0c2810')
  allyGrad.addColorStop(1,   '#081408')
  ctx.fillStyle = allyGrad
  ctx.fillRect(0, divY, boardW, boardH - divY)

  // ── Tilemap texture overlay ───────────────────────────────────────────────
  const tilemap = loadImg(TERRAIN.tilemap)
  if (tilemap.complete && tilemap.naturalWidth > 0) {
    ctx.globalAlpha = 0.3
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < cols; c++)
        ctx.drawImage(tilemap, 0, opts.tileSize, opts.tileSize, opts.tileSize, c * cw, r * ch, cw, ch)
    for (let r = 3; r < rows; r++)
      for (let c = 0; c < cols; c++)
        ctx.drawImage(tilemap, opts.tileSize, 0, opts.tileSize, opts.tileSize, c * cw, r * ch, cw, ch)
    ctx.globalAlpha = 1
  }

  // ── Ambient radial lighting ───────────────────────────────────────────────

  // Enemy zone: red glow from top-center
  const enemyAmbient = ctx.createRadialGradient(boardW / 2, 0, 0, boardW / 2, 0, boardW * 0.75)
  enemyAmbient.addColorStop(0,   'rgba(200, 40, 20, 0.22)')
  enemyAmbient.addColorStop(0.7, 'rgba(140, 20, 10, 0.08)')
  enemyAmbient.addColorStop(1,   'rgba(0, 0, 0, 0)')
  ctx.fillStyle = enemyAmbient
  ctx.fillRect(0, 0, boardW, divY)

  // Ally zone: blue-green glow from bottom-center
  const allyAmbient = ctx.createRadialGradient(boardW / 2, boardH, 0, boardW / 2, boardH, boardW * 0.75)
  allyAmbient.addColorStop(0,   'rgba(30, 130, 70, 0.22)')
  allyAmbient.addColorStop(0.7, 'rgba(20, 80, 40, 0.08)')
  allyAmbient.addColorStop(1,   'rgba(0, 0, 0, 0)')
  ctx.fillStyle = allyAmbient
  ctx.fillRect(0, divY, boardW, boardH - divY)

  // ── Kingdom buildings — drawn as background scenery ──────────────────────
  // Red kingdom: top edge (enemy side) — castle center, towers flanking
  // Blue kingdom: bottom edge (ally side) — castle center, towers flanking
  // Perspective: enemy buildings are smaller (far away), ally buildings larger (close)

  drawKingdom(ctx, 'red',  boardW, cw, ch, 0)       // enemy top
  drawKingdom(ctx, 'blue', boardW, cw, ch, divY)     // ally bottom (starts at divider)

  // ── Terrain props ─────────────────────────────────────────────────────────
  const rock1 = loadImg(TERRAIN.rock1)
  const rock2 = loadImg(TERRAIN.rock2)
  const bush1 = loadImg(TERRAIN.bush1)
  const bush2 = loadImg(TERRAIN.bush2)
  const propSize = Math.round(cw * 0.36)

  const props: { img: HTMLImageElement; c: number; r: number }[] = [
    { img: rock1, c: 0,        r: 0 },
    { img: rock2, c: cols - 1, r: 0 },
    { img: rock1, c: 3,        r: 1 },
    { img: rock2, c: cols - 4, r: 2 },
    { img: bush1, c: 0,        r: 3 },
    { img: bush2, c: cols - 1, r: 3 },
    { img: bush1, c: 2,        r: 4 },
    { img: bush2, c: cols - 3, r: 5 },
  ]

  for (const p of props) {
    if (!p.img.complete || p.img.naturalWidth === 0) continue
    ctx.globalAlpha = 0.5
    const px = p.c * cw + cw / 2 - propSize / 2
    const py = p.r * ch + ch - propSize - 2
    ctx.drawImage(p.img, px, py, propSize, propSize)
    ctx.globalAlpha = 1
  }

  // ── Divider ───────────────────────────────────────────────────────────────

  // Glow behind divider
  const divGlow = ctx.createLinearGradient(0, divY - 10, 0, divY + 10)
  divGlow.addColorStop(0,   'rgba(255, 200, 80, 0)')
  divGlow.addColorStop(0.5, 'rgba(255, 200, 80, 0.28)')
  divGlow.addColorStop(1,   'rgba(255, 200, 80, 0)')
  ctx.fillStyle = divGlow
  ctx.fillRect(0, divY - 10, boardW, 20)

  // Dashed gold line
  ctx.strokeStyle = 'rgba(220, 170, 60, 0.75)'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 7])
  ctx.beginPath()
  ctx.moveTo(0, divY)
  ctx.lineTo(boardW, divY)
  ctx.stroke()
  ctx.setLineDash([])

  // Zone labels
  ctx.save()
  ctx.font = 'bold 9px sans-serif'

  ctx.fillStyle = 'rgba(255, 100, 80, 0.5)'
  ctx.fillText('ENEMY ZONE', 8, 14)

  ctx.fillStyle = 'rgba(80, 200, 120, 0.5)'
  ctx.fillText('YOUR ZONE', 8, divY + 14)
  ctx.restore()

  // ── Grid lines ────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)'
  ctx.lineWidth = 1
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      ctx.strokeRect(c * cw + 0.5, r * ch + 0.5, cw - 1, ch - 1)

  // Column separators slightly brighter
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
  ctx.lineWidth = 1
  for (let c = 1; c < cols; c++) {
    ctx.beginPath()
    ctx.moveTo(c * cw, 0)
    ctx.lineTo(c * cw, boardH)
    ctx.stroke()
  }
}

export function drawHpBar(ctx: CanvasRenderingContext2D, unit: Unit, cx: number, cy: number, spriteW: number, spriteH: number) {
  const barW = spriteW - 4, barH = 5
  const bx = cx - barW / 2, by = cy + spriteH / 2 - barH - 1
  const pct = Math.max(0, unit.curHp / unit.maxHp)
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(bx, by, barW, barH)
  ctx.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171'
  ctx.fillRect(bx, by, Math.round(barW * pct), barH)
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 0.5; ctx.strokeRect(bx, by, barW, barH)
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: number, cx: number, cy: number, spriteH: number) {
  if (stars <= 1) return
  ctx.save(); ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = '#fbbf24'
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2
  const txt = '★'.repeat(stars), tw = ctx.measureText(txt).width
  ctx.strokeText(txt, cx - tw / 2, cy - spriteH / 2 + 10)
  ctx.fillText(txt, cx - tw / 2, cy - spriteH / 2 + 10)
  ctx.restore()
}

export function drawFloats(ctx: CanvasRenderingContext2D, unit: Unit, cx: number, cy: number, spriteH: number) {
  unit.floats = unit.floats.filter(f => {
    ctx.save(); ctx.globalAlpha = Math.max(0, f.life / 20)
    ctx.font = 'bold 13px sans-serif'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.fillStyle = f.color
    ctx.strokeText(f.txt, cx - 10, cy - spriteH / 2 - f.rise)
    ctx.fillText(f.txt, cx - 10, cy - spriteH / 2 - f.rise)
    ctx.restore(); f.rise += 1.5; f.life--; return f.life > 0
  })
}

export function drawUnit(ctx: CanvasRenderingContext2D, unit: Unit, frame: number, cx: number, cy: number, spriteW: number, spriteH: number) {
  const key = getSpriteKey(unit.spriteType, unit.enemy)
  const sheet = SPRITE_SHEETS[key]
  if (!sheet) return
  const animState: AnimState = unit.dead ? 'death' : (unit.animState as AnimState) ?? 'idle'
  const clip = sheet.clips[animState] ?? sheet.clips.idle
  const img = loadImg(clip.url)
  const destX = cx - spriteW / 2, destY = cy - spriteH / 2
  if (unit.dead) {
    const progress = clip.frames > 1 ? frame / (clip.frames - 1) : 1
    ctx.globalAlpha = Math.max(0.1, 1 - progress * 0.9)
  }
  if (img.complete && img.naturalWidth > 0) {
    const flipX = unit.facingLeft
    ctx.save()
    if (flipX) {
      ctx.translate(cx + spriteW / 2, destY); ctx.scale(-1, 1)
      ctx.drawImage(img, frame * clip.frameW, 0, clip.frameW, clip.frameH, 0, 0, spriteW, spriteH)
    } else {
      ctx.drawImage(img, frame * clip.frameW, 0, clip.frameW, clip.frameH, destX, destY, spriteW, spriteH)
    }
    ctx.restore()
  } else {
    ctx.fillStyle = unit.enemy ? '#7f1d1d' : '#1e3a5f'
    ctx.fillRect(destX + 4, destY + 4, spriteW - 8, spriteH - 8)
  }
  ctx.globalAlpha = 1
}

export function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
  for (const p of projectiles) {
    const arrowImg = loadImg(ARROW_SPRITES[p.team] ?? ARROW_SPRITES.blue)
    const curX = p.x + (p.tx - p.x) * p.progress
    const curY = p.y + (p.ty - p.y) * p.progress
    const angle = Math.atan2(p.ty - p.y, p.tx - p.x)
    const size = 20
    ctx.save(); ctx.translate(curX, curY); ctx.rotate(angle)
    if (arrowImg.complete && arrowImg.naturalWidth > 0) {
      ctx.drawImage(arrowImg, -size / 2, -size / 2, size, size)
    } else {
      ctx.strokeStyle = p.team === 'blue' ? '#60a5fa' : '#f87171'
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke()
    }
    ctx.restore()
  }
}
