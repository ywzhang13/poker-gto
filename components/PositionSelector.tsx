'use client';

import { POSITIONS, type Position } from '@/lib/gto-data';

interface Props {
  label: string;
  positions: Position[];
  selected: Position;
  onChange: (p: Position) => void;
}

const positionColors: Record<Position, string> = {
  UTG: '#EF4444',
  HJ: '#F97316',
  CO: '#EAB308',
  BTN: '#22C55E',
  SB: '#3B82F6',
  BB: '#8B5CF6',
};

export default function PositionSelector({ label, positions, selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#94A3B8] text-xs font-medium shrink-0 w-12">{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {positions.map((p) => {
          const active = selected === p;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className="px-2.5 py-1 rounded-md text-xs font-bold transition-all"
              style={{
                backgroundColor: active ? positionColors[p] : '#1E293B',
                color: active ? '#020617' : '#94A3B8',
                opacity: active ? 1 : 0.8,
              }}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
