'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5',
    'font-bold tracking-wide cursor-pointer select-none whitespace-nowrap',
    'border-none rounded-lg',
    'transition-[transform,filter,box-shadow] duration-75',
    'active:scale-95 active:brightness-85',
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      variant: {
        /* ── Solid gold — primary CTA ── */
        gold: [
          'bg-[linear-gradient(180deg,#f5d878_0%,#d4a030_40%,#9a6818_100%)]',
          'text-[#1a0e04] font-black',
          'shadow-[inset_0_1px_0_rgba(255,248,200,0.6),0_2px_0_#5a3a08,0_6px_20px_rgba(200,146,42,0.35)]',
          'border border-[rgba(245,216,120,0.4)]',
          'hover:brightness-110',
        ].join(' '),

        /* ── Danger red ── */
        red: [
          'bg-[linear-gradient(180deg,#e05050_0%,#a82424_100%)]',
          'text-[#fff0f0]',
          'shadow-[0_2px_0_#6e1414,0_4px_16px_rgba(168,36,36,0.4)]',
          'border border-[rgba(255,120,120,0.2)]',
        ].join(' '),

        /* ── Blue ── */
        blue: [
          'bg-[linear-gradient(180deg,#5aabff_0%,#2460a8_100%)]',
          'text-[#e8f4ff]',
          'shadow-[0_2px_0_#1a3f70,0_4px_16px_rgba(36,96,168,0.35)]',
          'border border-[rgba(100,180,255,0.2)]',
        ].join(' '),

        /* ── Ghost ── */
        ghost: [
          'bg-[rgba(255,255,255,0.04)]',
          'text-[var(--text-2)]',
          'border border-[var(--border)]',
          'hover:bg-[rgba(255,255,255,0.08)]',
        ].join(' '),

        /* ── Danger subtle ── */
        danger: [
          'bg-[linear-gradient(180deg,#cf6d52_0%,#a24c35_100%)]',
          'text-[#fff3ee]',
          'shadow-[0_2px_0_#6a2f1f]',
          'border border-[rgba(255,140,120,0.2)]',
        ].join(' '),

        /* ── Pixel Gold — main action ── */
        pixelGold: [
          'rounded-none border-2 border-[#5c3b0f]',
          'bg-[linear-gradient(180deg,#f5d878_0%,#c88a20_100%)]',
          'text-[#1a0e04]',
          'shadow-[inset_-2px_-2px_0_#8a5510,inset_2px_2px_0_#fff5c0,0_4px_0_#5c3b0f,0_6px_16px_rgba(200,146,42,0.3)]',
          'active:translate-y-[2px] active:shadow-[inset_-2px_-2px_0_#8a5510,inset_2px_2px_0_#fff5c0,0_2px_0_#5c3b0f]',
        ].join(' '),

        /* ── Pixel Blue ── */
        pixelBlue: [
          'rounded-none border-2 border-[#173a67]',
          'bg-[linear-gradient(180deg,#82bfff_0%,#2a5ea0_100%)]',
          'text-[#eef7ff]',
          'shadow-[inset_-2px_-2px_0_#1a3f70,inset_2px_2px_0_#c8e8ff,0_4px_0_#173a67,0_6px_16px_rgba(36,96,168,0.3)]',
          'active:translate-y-[2px] active:shadow-[inset_-2px_-2px_0_#1a3f70,inset_2px_2px_0_#c8e8ff,0_2px_0_#173a67]',
        ].join(' '),

        /* ── Pixel Danger ── */
        pixelDanger: [
          'rounded-none border-2 border-[#5b1f17]',
          'bg-[linear-gradient(180deg,#ea8d7a_0%,#b44735_100%)]',
          'text-[#fff3ef]',
          'shadow-[inset_-2px_-2px_0_#8a2f20,inset_2px_2px_0_#ffd2c8,0_4px_0_#6a2f1f,0_6px_16px_rgba(168,48,36,0.3)]',
          'active:translate-y-[2px] active:shadow-[inset_-2px_-2px_0_#8a2f20,inset_2px_2px_0_#ffd2c8,0_2px_0_#6a2f1f]',
        ].join(' '),

        /* ── Pixel Ghost ── */
        pixelGhost: [
          'rounded-none border-2 border-[rgba(200,146,42,0.4)]',
          'bg-[rgba(200,146,42,0.06)]',
          'text-[var(--text-2)]',
          'shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,220,100,0.08),0_4px_0_rgba(0,0,0,0.4)]',
          'active:translate-y-[2px] active:shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,220,100,0.08),0_2px_0_rgba(0,0,0,0.4)]',
        ].join(' '),
      },
      size: {
        sm: 'h-9  px-3 text-xs  rounded-lg',
        md: 'h-11 px-4 text-sm  rounded-xl',
        lg: 'h-14 px-6 text-base rounded-2xl',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
