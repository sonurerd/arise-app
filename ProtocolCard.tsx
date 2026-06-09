import { Play } from 'lucide-react'
import type { Protocol } from '../types'
import { formatDuration } from './DurationPicker'

interface Props {
  protocol: Protocol
  onStart: () => void
}

export function ProtocolCard({ protocol, onStart }: Props) {
  return (
    <div className="glass p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 to-amber-400 opacity-70" />
      <h3 className="text-lg font-semibold text-zinc-100">{protocol.name}</h3>
      <p className="text-sm text-orange-400/80 mt-2 font-medium">{formatDuration(protocol.duration)}</p>
      <button
        onClick={onStart}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl btn-primary text-sm"
      >
        <Play size={14} />
        Start
      </button>
    </div>
  )
}