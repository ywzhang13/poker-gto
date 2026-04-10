'use client';

import { useState, useMemo } from 'react';
import ScenarioTabs from '@/components/ScenarioTabs';
import PositionSelector from '@/components/PositionSelector';
import HandMatrix from '@/components/HandMatrix';
import Legend from '@/components/Legend';
import {
  type Scenario,
  type Position,
  POSITIONS,
  getRange,
  getVillainPositions,
  needsVillain,
} from '@/lib/gto-data';

const scenarioNames: Record<Scenario, string> = {
  rfi: 'Open Raise 開牌範圍',
  '3bet': '面對 Open — 防守 (Call) / 3-Bet / Fold',
  vs3bet: '你 Open 後被 3-Bet — 回應策略',
  '4bet': '4-Bet 範圍',
  vs4bet: '面對 4-Bet 的回應',
  '5bet': '5-Bet All-in 範圍',
};

export default function Home() {
  const [scenario, setScenario] = useState<Scenario>('rfi');
  const [hero, setHero] = useState<Position>('UTG');
  const [villain, setVillain] = useState<Position>('UTG');

  const showVillain = needsVillain(scenario);
  const heroPositions = POSITIONS;

  const villainPositions = useMemo(
    () => (showVillain ? getVillainPositions(scenario, hero) : []),
    [scenario, hero, showVillain],
  );

  const effectiveVillain = useMemo(() => {
    if (!showVillain) return hero;
    if (villainPositions.includes(villain)) return villain;
    return villainPositions[0] ?? hero;
  }, [showVillain, villainPositions, villain, hero]);

  const range = useMemo(
    () => getRange(scenario, hero, effectiveVillain),
    [scenario, hero, effectiveVillain],
  );

  // Count raise/call/fold/allin hands
  const stats = useMemo(() => {
    if (!range) return null;
    const counts = { raise: 0, call: 0, fold: 0, allin: 0, mixed: 0 };
    Object.values(range).forEach((ha) => {
      if (!ha) { counts.fold++; return; }
      counts[ha.action]++;
    });
    return counts;
  }, [range]);

  const heroLabel = (() => {
    switch (scenario) {
      case 'rfi': return '位置';
      case '3bet': return 'Hero';
      case 'vs3bet': return 'Opener';
      case '4bet': return 'Hero';
      case 'vs4bet': return '3-Bettor';
      case '5bet': return 'Hero';
    }
  })();

  const villainLabel = (() => {
    switch (scenario) {
      case '3bet': return 'vs Opener';
      case 'vs3bet': return 'vs 3-Bettor';
      case '4bet': return 'vs 3-Bettor';
      case 'vs4bet': return 'vs 4-Bettor';
      case '5bet': return 'vs 4-Bettor';
      default: return 'Villain';
    }
  })();

  return (
    <div className="flex flex-col min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-[#1E293B]">
        <div className="max-w-4xl mx-auto flex items-baseline gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
            Poker GTO
          </h1>
          <span className="text-[#64748B] text-sm">6-Max 100bb 翻前策略表</span>
        </div>
      </header>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/50">
        <div className="max-w-4xl mx-auto space-y-3">
          <ScenarioTabs selected={scenario} onChange={setScenario} />

          <div className="flex flex-wrap gap-4 items-start">
            <PositionSelector
              label={heroLabel}
              positions={heroPositions}
              selected={hero}
              onChange={setHero}
            />

            {showVillain && villainPositions.length > 0 && (
              <PositionSelector
                label={villainLabel}
                positions={villainPositions}
                selected={effectiveVillain}
                onChange={setVillain}
              />
            )}
          </div>

          {/* Scenario description + stats */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#64748B]">
              {scenarioNames[scenario]} — {hero}{showVillain ? ` vs ${effectiveVillain}` : ''}
            </p>
            {stats && (
              <div className="flex gap-3 text-[10px] sm:text-xs">
                {stats.raise > 0 && <span className="text-[#22C55E]">Raise {stats.raise}</span>}
                {stats.call > 0 && <span className="text-[#3B82F6]">Call {stats.call}</span>}
                {stats.allin > 0 && <span className="text-[#8B5CF6]">All-in {stats.allin}</span>}
                {stats.mixed > 0 && <span className="text-[#EAB308]">Mixed {stats.mixed}</span>}
                <span className="text-[#EF4444]/60">Fold {stats.fold}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matrix — full width */}
      <div className="flex-1 px-2 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <HandMatrix range={range} />
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 sm:px-6 py-3 border-t border-[#1E293B] bg-[#0F172A]/50">
        <div className="max-w-4xl mx-auto">
          <Legend scenario={scenario} />
          <p className="text-center text-[10px] text-[#475569] mt-2">
            點擊格子查看詳細策略 · 基於 6-Max 100bb NL Solver
          </p>
        </div>
      </div>
    </div>
  );
}
