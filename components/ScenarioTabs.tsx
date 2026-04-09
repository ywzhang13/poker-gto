'use client';

import { SCENARIOS, type Scenario } from '@/lib/gto-data';

interface Props {
  selected: Scenario;
  onChange: (s: Scenario) => void;
}

export default function ScenarioTabs({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SCENARIOS.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
            ${
              selected === s.key
                ? 'bg-[#3B82F6] text-white'
                : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
            }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
