'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../game/state/gameStore'
import { getBoardUnitCount } from '../game/systems/boardSystem'
import { evaluateBattleEnd } from '../game/systems/combatSystem'
import PixiBoard from '../game/renderer/PixiBoard'
import TopBar from './TopBar'
import EnemyIntel from './EnemyIntel'
import Bench from './Bench'
import Shop from './Shop'
import Controls from './Controls'
import BattleLog from './BattleLog'
import RoundModal from './RoundModal'

const BATTLE_LIMIT_MS = 30_000

export default function GameHUD() {
  const store = useGameStore()
  const {
    round, hp, gold, phase, maxBoardSlots,
    board, bench, shop, selected, battleRunning,
    battleTimeMs, speedUp, enemyPreview, log,
    clickBoardCell, clickBenchSlot, buyUnit, reroll, sellSelected,
    startBattle, tickBattle, nextRound,
  } = store

  // ── Battle RAF loop ───────────────────────────────────────────────────────
  const rafRef    = useRef<number>(0)
  const lastTsRef = useRef<number>(0)

  useEffect(() => {
    if (!battleRunning) {
      cancelAnimationFrame(rafRef.current)
      lastTsRef.current = 0
      return
    }
    function loop(ts: number) {
      const delta = lastTsRef.current ? Math.min(ts - lastTsRef.current, 100) : 16
      lastTsRef.current = ts
      tickBattle(delta)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [battleRunning, tickBattle])

  const secondsLeft = speedUp
    ? 0
    : Math.max(0, Math.ceil((BATTLE_LIMIT_MS - battleTimeMs) / 1000))

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<{
    show: boolean; title: string; titleColor: string
    description: string; buttonLabel: string
  }>({ show: false, title: '', titleColor: '', description: '', buttonLabel: '' })

  useEffect(() => {
    if (phase !== 'battle' || battleRunning) return
    const result = evaluateBattleEnd(board, round)
    if (hp <= 0) {
      setModal({
        show: true, title: '☠️ Game Over', titleColor: '#ef4444',
        description: 'HP habis! Pertandingan selesai.', buttonLabel: 'Main Lagi',
      })
    } else if (result.win) {
      setModal({
        show: true, title: '🏆 Menang!', titleColor: '#22c55e',
        description: `${result.aliveCount} unit selamat! +🪙${result.goldEarned} koin. Slot bertambah!`,
        buttonLabel: round >= 5 ? 'Main Lagi' : `Ronde ${round + 1} →`,
      })
    } else {
      setModal({
        show: true, title: '😤 Kalah!', titleColor: '#f97316',
        description: `−${result.hpLost} HP. Sisa HP: ${Math.max(0, hp - result.hpLost)}`,
        buttonLabel: round >= 5 ? 'Main Lagi' : `Ronde ${round + 1} →`,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleRunning, phase])

  const boardCount = getBoardUnitCount(board)
  const isPrep = phase === 'prep'

  return (
    <div
      className="flex flex-col max-w-[430px] mx-auto select-none"
      style={{
        minHeight: '100dvh',
        paddingTop: 'max(env(safe-area-inset-top), 8px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
        paddingLeft: 8,
        paddingRight: 8,
        gap: 8,
      }}
    >
      <h1 className="sr-only">Celo Tactics</h1>

      {/* ── 1. Top bar ── */}
      <TopBar
        round={round} hp={hp} gold={gold}
        boardUnitCount={boardCount} maxBoardSlots={maxBoardSlots} phase={phase}
      />

      {/* ── 2. Enemy intel (prep only) ── */}
      {isPrep && (
        <EnemyIntel enemies={enemyPreview} round={round} />
      )}

      {/* ── 3. Battle board ── */}
      <div className="rounded-xl overflow-hidden border border-[rgba(212,170,80,0.2)] bg-[#0a0812] shadow-[0_0_0_1px_rgba(212,170,80,0.06)_inset,0_8px_32px_rgba(0,0,0,0.5)] flex-shrink-0">
        <PixiBoard
          board={board} phase={phase} selected={selected}
          maxBoardSlots={maxBoardSlots} speedUp={speedUp}
          onCellClick={clickBoardCell}
        />
      </div>

      {/* ── 4. Bench ── */}
      <Bench bench={bench} selected={selected} onSlotClick={clickBenchSlot} />

      {/* ── 5. Shop (prep only) ── */}
      {isPrep && <Shop shop={shop} onBuy={buyUnit} />}

      {/* ── 6. Controls / timer ── */}
      <Controls
        phase={phase} hasSelected={selected !== null}
        battleRunning={battleRunning} secondsLeft={secondsLeft} speedUp={speedUp}
        onReroll={reroll} onSell={sellSelected} onBattle={startBattle}
      />

      {/* ── 7. Battle log ── */}
      <BattleLog log={log} />

      {/* ── 8. Round result modal ── */}
      <RoundModal
        show={modal.show} title={modal.title} titleColor={modal.titleColor}
        description={modal.description} buttonLabel={modal.buttonLabel}
        onNext={() => { setModal(m => ({ ...m, show: false })); nextRound() }}
      />
    </div>
  )
}
