import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  label: string
  value: string
  icon: LucideIcon
  color?: string
}

export function StatCard({ label, value, icon: Icon, color = 'text-white' }: Props) {
  return (
    <div className="glass p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
          <p className={clsx('text-4xl font-bold mt-2 tracking-tight', color)}>{value}</p>
        </div>
        <Icon size={22} className="text-zinc-700" />
      </div>
    </div>
  )
}