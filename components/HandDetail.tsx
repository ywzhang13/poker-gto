'use client';

import { type HandAction, type Action } from '@/lib/gto-data';
import { combos } from '@/lib/hands';

interface Props {
  hand: string;
  action: HandAction | null;
  onClose: () => void;
}

const actionLabels: Record<Action, string> = {
  raise: 'Raise / Open',
  call: 'Call',
  fold: 'Fold',
  allin: 'All-in',
  mixed: 'Mixed',
};

const actionColors: Record<Action, string> = {
  raise: '#22C55E',
  call: '#3B82F6',
  fold: '#EF4444',
  allin: '#8B5CF6',
  mixed: '#EAB308',
};

export default function HandDetail({ hand, action, onClose }: Props) {
  if (!action) return null;

  const numCombos = combos(hand);
  const handType = hand.length === 2 ? 'Pair' : hand.endsWith('s') ? 'Suited' : 'Offsuit';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#0F172A] border border-[#1E293B] rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 pb-8 sm:pb-5">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#94A3B8] hover:text-white text-lg leading-none"
        >
          &times;
        </button>

        <h3 className="text-2xl font-bold text-[#F8FAFC] mb-1">{hand}</h3>
        <p className="text-xs text-[#64748B] mb-4">
          {handType} &middot; {numCombos} combos
        </p>

        {action.action === 'mixed' && action.mixedActions ? (
          <div className="space-y-2">
            {action.mixedActions.map((ma, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: actionColors[ma.action] }}
                />
                <span className="text-sm text-[#F8FAFC] font-medium flex-1">
                  {actionLabels[ma.action]}
                </span>
                <span className="text-sm font-bold" style={{ color: actionColors[ma.action] }}>
                  {ma.frequency}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: actionColors[action.action] }}
            />
            <span className="text-base text-[#F8FAFC] font-semibold">
              {actionLabels[action.action]}
            </span>
            <span className="text-base font-bold ml-auto" style={{ color: actionColors[action.action] }}>
              {action.frequency ?? 100}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
