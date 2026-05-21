'use client'

import { useEffect, useRef } from 'react'

export default function BattleLog({ log }: { log: string[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [log])

  return (
    <div
      ref={ref}
      className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[11px] text-[var(--text-secondary)] leading-relaxed min-h-[40px] max-h-[60px] overflow-y-auto scroll-x"
      role="log"
      aria-live="polite"
      aria-label="Log pertempuran"
    >
      {log.map((line, i) => (
        <div key={i} className="py-[1px]">{line}</div>
      ))}
    </div>
  )
}
