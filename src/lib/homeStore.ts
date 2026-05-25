'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────────────────────
export type TaskIconId = 'swords' | 'shield' | 'trophy' | 'zap' | 'star' | 'flame'

export interface DailyTaskDef {
  id: string
  label: string
  desc: string
  reward: number
  total: number
  iconId: TaskIconId
}

export interface DailyTaskState {
  id: string
  progress: number
  done: boolean
}

export interface ChestReward {
  label: string
  amount: number
}

// ── Static definitions ────────────────────────────────────────────────────────
export const DAILY_TASK_DEFS: DailyTaskDef[] = [
  { id: 'play1',   label: 'First Battle', desc: 'Play 1 match today',       reward: 50,  total: 1, iconId: 'swords' },
  { id: 'play3',   label: 'Warrior',      desc: 'Play 3 matches today',     reward: 120, total: 3, iconId: 'shield' },
  { id: 'win1',    label: 'Victor',       desc: 'Win 1 match',              reward: 80,  total: 1, iconId: 'trophy' },
  { id: 'reroll5', label: 'Gambler',      desc: 'Reroll the shop 5 times',  reward: 30,  total: 5, iconId: 'zap'    },
  { id: 'merge1',  label: 'Alchemist',    desc: 'Merge a unit to star 2',   reward: 60,  total: 1, iconId: 'star'   },
  { id: 'streak',  label: 'Daily Streak', desc: 'Log in 3 days in a row',   reward: 200, total: 3, iconId: 'flame'  },
]

export const CHEST_REWARDS: ChestReward[] = [
  { label: 'Gold Coins', amount: 150 },
  { label: 'Battle XP',  amount: 300 },
  { label: 'Rare Shard', amount: 1   },
  { label: 'Gold Coins', amount: 80  },
  { label: 'Battle XP',  amount: 500 },
  { label: 'Epic Shard', amount: 1   },
]

// ── Referral / Friends ───────────────────────────────────────────────────────
export interface Friend {
  id:        string
  name:      string
  avatarIdx: number
  joinedAt:  string   // ISO date string
  rewarded:  boolean  // reward already claimed for this referral
}

const REFERRAL_REWARD = 100  // pts per successful referral claim

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function defaultTaskStates(): DailyTaskState[] {
  return DAILY_TASK_DEFS.map(t => ({ id: t.id, progress: 0, done: false }))
}

// ── Store ─────────────────────────────────────────────────────────────────────
interface HomeState {
  // Player
  playerName:  string
  avatarIdx:   number
  totalPoints: number
  streakDays:  number
  level:       number
  isOnboarded: boolean          // false = first-time user
  // Daily (reset each day)
  today:       string
  taskStates:  DailyTaskState[]
  chestOpened: boolean
  // Friends & Referral
  friends:          Friend[]
  referralCode:     string
  usedReferralCode: string | null   // code entered by this user (null = not yet used)
  // Actions
  setPlayerName:  (name: string) => void
  setAvatarIdx:   (idx: number)  => void
  addPoints:      (n: number)    => void
  claimTask:      (id: string)   => void
  openChest:      () => ChestReward | null
  completeOnboarding: (name: string, avatarIdx: number) => void
  claimReferralReward: (friendId: string) => void
  submitReferralCode:  (code: string) => boolean  // returns true if accepted
}

export const useHomeStore = create<HomeState>()(
  persist(
    (set, get) => ({
      playerName:  'Commander',
      avatarIdx:   1,
      totalPoints: 0,
      streakDays:  0,
      level:       1,
      isOnboarded: false,
      today:       todayKey(),
      taskStates:  defaultTaskStates(),
      chestOpened: false,
      friends:          [],
      referralCode:     Math.random().toString(36).slice(2, 8).toUpperCase(),
      usedReferralCode: null,

      setPlayerName: (name) => set({ playerName: name }),
      setAvatarIdx:  (idx)  => set({ avatarIdx: idx }),
      addPoints:     (n)    => set(s => ({ totalPoints: s.totalPoints + n })),

      completeOnboarding(name, avatarIdx) {
        set({ playerName: name, avatarIdx, isOnboarded: true })
      },

      claimTask(id) {
        const def = DAILY_TASK_DEFS.find(d => d.id === id)
        if (!def) return
        set(s => {
          const taskStates = s.taskStates.map(t => {
            if (t.id !== id || t.done || t.progress < def.total) return t
            return { ...t, done: true }
          })
          const claimed = taskStates.find(t => t.id === id)?.done && !s.taskStates.find(t => t.id === id)?.done
          return {
            taskStates,
            totalPoints: claimed ? s.totalPoints + def.reward : s.totalPoints,
          }
        })
      },

      openChest() {
        const { chestOpened } = get()
        if (chestOpened) return null
        const reward = CHEST_REWARDS[Math.floor(Math.random() * CHEST_REWARDS.length)]
        set(s => ({ chestOpened: true, totalPoints: s.totalPoints + reward.amount }))
        return reward
      },

      claimReferralReward(friendId) {
        set(s => {
          const friends = s.friends.map(f =>
            f.id === friendId && !f.rewarded ? { ...f, rewarded: true } : f
          )
          const didClaim = friends.find(f => f.id === friendId)?.rewarded &&
                           !s.friends.find(f => f.id === friendId)?.rewarded
          return {
            friends,
            totalPoints: didClaim ? s.totalPoints + REFERRAL_REWARD : s.totalPoints,
          }
        })
      },

      submitReferralCode(code) {
        const { usedReferralCode, referralCode } = get()
        const normalized = code.trim().toUpperCase()
        // Reject: already used, empty, or own code
        if (usedReferralCode || !normalized || normalized === referralCode) return false
        // Accept — give bonus points to this user
        set(s => ({
          usedReferralCode: normalized,
          totalPoints: s.totalPoints + REFERRAL_REWARD,
        }))
        return true
      },
    }),
    {
      name: 'cetas_home_state',
      // Reset daily fields when the day changes
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.today !== todayKey()) {
          state.today       = todayKey()
          state.taskStates  = defaultTaskStates()
          state.chestOpened = false
        }
      },
    }
  )
)
