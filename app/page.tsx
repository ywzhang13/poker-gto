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

export default function Home() {
  const [scenario, setScenario] = useState<Scenario>('rfi');
  const [hero, setHero] = useState<Position>('UTG');
  const [villain, setVillain] = useState<Position>('UTG');

  const showVillain = needsVillain(scenario);

  // Available hero positions (all for most scenarios)
  const heroPositions = POSITIONS;

  // Available villain positions depend on scenario + hero
  const villainPositions = useMemo(
    () => (showVillain ? getVillainPositions(scenario, hero) : []),
    [scenario, hero, showVillain],
  );

  // Auto-select first valid villain when hero/scenario changes
  const effectiveVillain = useMemo(() => {
    if (!showVillain) return hero; // RFI uses hero=villain
    if (villainPositions.includes(villain)) return villain;
    return villainPositions[0] ?? hero;
  }, [showVillain, villainPositions, villain, hero]);

  const range = useMemo(
    () => getRange(scenario, hero, effectiveVillain),
    [scenario, hero, effectiveVillain],
  );

  // Scenario descriptions
  const scenarioDesc: Record<Scenario, string> = {
    rfi: 'Open raise range from selected position',
    '3bet': `3-Bet range from ${hero} vs opener`,
    vs3bet: `${hero} opens, facing 3-bet from ${effectiveVillain}`,
    '4bet': `4-Bet range from ${hero} vs 3-bettor`,
    vs4bet: `${hero} 3-bets, facing 4-bet from ${effectiveVillain}`,
    '5bet': `5-Bet all-in range from ${hero}`,
  };

  // Labels for hero / villain depending on scenario
  const heroLabel = (() => {
    switch (scenario) {
      case 'rfi': return 'Pos';
      case '3bet': return 'Hero';
      case 'vs3bet': return 'Opener';
      case '4bet': return 'Hero';
      case 'vs4bet': return '3-Bettor';
      case '5bet': return 'Hero';
    }
  })();

  const villainLabel = (() => {
    switch (scenario) {
      case '3bet': return 'Opener';
      case 'vs3bet': return '3-Bettor';
      case '4bet': return '3-Bettor';
      case 'vs4bet': return '4-Bettor';
      case '5bet': return '4-Bettor';
      default: return 'Villain';
    }
  })();

  return (
    <div className="flex flex-col flex-1 bg-[#020617] min-h-screen">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
          Poker GTO <span className="text-[#64748B] font-normal text-sm">Preflop Chart</span>
        </h1>
      </header>

      {/* Controls */}
      <div className="px-4 space-y-3 pb-3">
        <ScenarioTabs selected={scenario} onChange={setScenario} />

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

        <p className="text-[11px] text-[#64748B]">{scenarioDesc[scenario]}</p>
      </div>

      {/* Matrix */}
      <div className="flex-1 px-2 sm:px-4 pb-2">
        <HandMatrix range={range} />
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-[#1E293B]">
        <Legend />
        <p className="text-center text-[9px] text-[#475569] mt-2">
          Tap any cell for details &middot; 6-max 100bb NL
        </p>
      </div>
    </div>
  );
}
