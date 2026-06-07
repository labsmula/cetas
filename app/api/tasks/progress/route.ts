// POST /api/tasks/progress — authenticated task progress updater.
// Used by gameplay actions that happen client-side (reroll, merge, etc.).
// Battle completion progress is still derived server-side via /api/player/endless.


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { requireAuth } from '@/src/lib/api-auth'
import { progressTaskBodySchema, getZodMessage } from '@/src/lib/validation'

const CLIENT_PROGRESS_TASKS = new Set(['reroll5', 'merge1'])

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req)
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = progressTaskBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: getZodMessage(parsed.error) }, { status: 400 })
    }
    const { taskId, increment } = parsed.data

    if (!CLIENT_PROGRESS_TASKS.has(taskId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const date = todayKey()

    const def = await prisma.taskDefinition.findUnique({ where: { id: taskId } })
    if (!def) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    const progress = await prisma.taskProgress.upsert({
      where:  { playerId_taskId_date: { playerId: auth.playerId, taskId, date } },
      create: {
        playerId: auth.playerId,
        taskId,
        date,
        progress: Math.min(increment, def.total),
        done:     increment >= def.total,
      },
      update: { progress: { increment } },
    })

    const capped = Math.min(progress.progress, def.total)
    const done = capped >= def.total
    if (progress.progress !== capped || progress.done !== done) {
      await prisma.taskProgress.update({
        where: { id: progress.id },
        data:  { progress: capped, done },
      })
    }

    return NextResponse.json({
      data: { taskId, progress: capped, done },
    })
  } catch (err) {
    console.error('[POST /api/tasks/progress]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
