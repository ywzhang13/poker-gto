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
  if (!ha) return 0.15;
  if (ha.action === 'fold') return 0.15;
  if (ha.action === 'mixed') {
    // opacity based on non-fold portion
    const nonFold = ha.mixedActions?.filter((a) => a.action !== 'fold')
      .reduce((s, a) => s + a.frequency, 0) ?? 50;
    return 0.3 + (nonFold / 100) * 0.7;
  }
  const f = ha.frequency ?? 100;
  return 0.3 + (f / 100) * 0.7;
}

export default function HandMatrix({ range }: Props) {
  const matrix = useMemo(() => buildMatrix(), []);
  const [selected, setSelected] = useState<{ hand: string; action: HandAction | null } | null>(null);

  if (!range) {
    return (
      <div className="flex items-center justify-center h-64 text-[#64748B] text-sm">
        Select a valid position combination
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div
          className="grid gap-[1px] mx-auto"
          style={{
            gridTemplateColumns: `repeat(14, minmax(0, 1fr))`,
            maxWidth: '100%',
            width: 'fit-content',
            minWidth: '340px',
          }}
        >
          {/* header row */}
          <div className="w-full" />
          {RANKS.map((r) => (
            <div
              key={`h-${r}`}
              className="flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[#64748B] h-5"
            >
              {r}
            </div>
          ))}

          {/* matrix rows */}
          {matrix.map((row, ri) => (
            <Fragment key={`row-${ri}`}>
              {/* row label */}
              <div
                className="flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[#64748B]"
              >
                {RANKS[ri]}
              </div>
              {row.map((cell) => {
                const ha = range[cell.name];
                const bg = cellBg(ha);
                const opacity = cellOpacity(ha);
                return (
                  <button
                    key={cell.name}
                    onClick={() => setSelected({ hand: cell.name, action: ha ?? null })}
                    className="aspect-square flex items-center justify-center rounded-[2px] sm:rounded transition-transform active:scale-90 cursor-pointer"
                    style={{
                      backgroundColor: bg,
                      opacity,
                    }}
                    title={cell.name}
                  >
                    <span className="text-[7px] sm:text-[9px] font-semibold text-white leading-none select-none mix-blend-difference">
                      {cell.name}
                    </span>
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
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
