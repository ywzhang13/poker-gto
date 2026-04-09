'use client';

import { useState, useMemo, Fragment } from 'react';
import { buildMatrix, RANKS } from '@/lib/hands';
import { type RangeMap, type HandAction, type Action } from '@/lib/gto-data';
import HandDetail from './HandDetail';

interface Props {
  range: RangeMap | null;
}

const actionColors: Record<Action, string> = {
  raise: '#22C55E',
  call: '#3B82F6',
  fold: '#EF4444',
  allin: '#8B5CF6',
  mixed: '#EAB308',
};

function cellBg(ha: HandAction | undefined): string {
  if (!ha) return actionColors.fold;
  if (ha.action === 'mixed') return actionColors.mixed;
  return actionColors[ha.action];
}

function cellOpacity(ha: HandAction | undefined): number {
  if (!ha) return 0.18;
  if (ha.action === 'fold') return 0.18;
  if (ha.action === 'mixed') {
    const nonFold = ha.mixedActions?.filter((a) => a.action !== 'fold')
      .reduce((s, a) => s + a.frequency, 0) ?? 50;
    return 0.35 + (nonFold / 100) * 0.65;
  }
  const f = ha.frequency ?? 100;
  return 0.35 + (f / 100) * 0.65;
}

export default function HandMatrix({ range }: Props) {
  const matrix = useMemo(() => buildMatrix(), []);
  const [selected, setSelected] = useState<{ hand: string; action: HandAction | null } | null>(null);

  if (!range) {
    return (
      <div className="flex items-center justify-center h-64 text-[#64748B] text-sm">
        請選擇有效的位置組合
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Column headers */}
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `28px repeat(13, 1fr)` }}>
          <div />
          {RANKS.map((r) => (
            <div key={`h-${r}`} className="text-center text-[11px] sm:text-sm font-bold text-[#94A3B8] py-1">
              {r}
            </div>
          ))}
        </div>

        {/* Matrix rows */}
        {matrix.map((row, ri) => (
          <div
            key={`row-${ri}`}
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: `28px repeat(13, 1fr)` }}
          >
            {/* Row label */}
            <div className="flex items-center justify-center text-[11px] sm:text-sm font-bold text-[#94A3B8]">
              {RANKS[ri]}
            </div>

            {/* Cells */}
            {row.map((cell) => {
              const ha = range[cell.name];
              const bg = cellBg(ha);
              const opacity = cellOpacity(ha);
              const isMixed = ha?.action === 'mixed';
              return (
                <button
                  key={cell.name}
                  onClick={() => setSelected({ hand: cell.name, action: ha ?? null })}
                  className="aspect-square flex items-center justify-center rounded-sm sm:rounded cursor-pointer
                             transition-all duration-100 active:scale-90 hover:ring-2 hover:ring-white/40 hover:z-10
                             relative overflow-hidden"
                  style={{ backgroundColor: bg, opacity }}
                >
                  {/* Mixed indicator: split diagonal */}
                  {isMixed && (
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
                  )}
                  <span className="text-[8px] sm:text-[11px] md:text-xs font-bold text-white leading-none select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] relative z-[1]">
                    {cell.name}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selected && (
        <HandDetail
          hand={selected.hand}
          action={selected.action}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
