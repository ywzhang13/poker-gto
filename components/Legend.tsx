'use client';

import { type Scenario } from '@/lib/gto-data';

const baseItems = [
  { label: 'Raise', color: '#22C55E' },
  { label: 'Call / 防守', color: '#3B82F6' },
  { label: 'Fold', color: '#EF4444' },
  { label: 'All-in', color: '#8B5CF6' },
  { label: 'Mixed 混合', color: '#EAB308' },
];

const scenarioHints: Record<Scenario, string> = {
  rfi: '綠色 = Open Raise，紅色 = 不開',
  '3bet': '綠色 = 3-Bet，藍色 = Cold Call 防守，紅色 = 棄牌',
  vs3bet: '綠色 = 4-Bet，藍色 = Call 防守，紅色 = 棄牌',
  '4bet': '綠色 = 4-Bet，藍色 = Call，紅色 = 棄牌',
  vs4bet: '綠色 = 5-Bet，藍色 = Call，紅色 = 棄牌',
  '5bet': '紫色 = All-in，藍色 = Call，紅色 = 棄牌',
};

interface Props {
  scenario?: Scenario;
}

export default function Legend({ scenario }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {baseItems.map((i) => (
          <div key={i.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: i.color }} />
            <span className="text-[10px] text-[#94A3B8] font-medium">{i.label}</span>
          </div>
        ))}
      </div>
      {scenario && (
        <p className="text-center text-[11px] text-[#64748B]">
          {scenarioHints[scenario]}
        </p>
      )}
    </div>
  );
}
