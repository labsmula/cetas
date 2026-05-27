'use client'

import dynamic from 'next/dynamic'
import { LoadingState } from '@/src/components/ui/LoadingState'

const GameHUD = dynamic(() => import('../../src/ui/GameHUD'), {
  ssr: false,
  loading: () => <LoadingState label="Loading battle" className="h-full" />,
})

export default function GamePage() {
  return <GameHUD />
}
