// ---------------------------------------------------------------------------
// GTO Preflop Ranges — 6-max 100bb Cash (solver approximations)
// ---------------------------------------------------------------------------

export type Action = 'raise' | 'call' | 'fold' | 'allin' | 'mixed';

export interface HandAction {
  action: Action;
  frequency?: number;          // 0-100 primary action %
  mixedActions?: { action: Action; frequency: number }[];
}

export type RangeMap = Record<string, HandAction>;

export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Scenario = 'rfi' | '3bet' | 'vs3bet' | '4bet' | 'vs4bet' | '5bet';

export const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
export const SCENARIOS: { key: Scenario; label: string }[] = [
  { key: 'rfi', label: 'RFI' },
  { key: '3bet', label: '3-Bet' },
  { key: 'vs3bet', label: 'vs 3-Bet' },
  { key: '4bet', label: '4-Bet' },
  { key: 'vs4bet', label: 'vs 4-Bet' },
  { key: '5bet', label: '5-Bet' },
];

// helpers
const R = (f?: number): HandAction => ({ action: 'raise', frequency: f ?? 100 });
const C = (f?: number): HandAction => ({ action: 'call', frequency: f ?? 100 });
const F: HandAction = { action: 'fold', frequency: 100 };
const A = (f?: number): HandAction => ({ action: 'allin', frequency: f ?? 100 });
const M = (acts: { action: Action; frequency: number }[]): HandAction => ({
  action: 'mixed',
  mixedActions: acts,
});

// All 169 hands helper — fill default then override
import { allHandNames } from './hands';
const ALL = allHandNames();

function fill(overrides: Record<string, HandAction>, defaultAction: HandAction = F): RangeMap {
  const m: RangeMap = {};
  for (const h of ALL) m[h] = defaultAction;
  for (const [h, a] of Object.entries(overrides)) m[h] = a;
  return m;
}

// =====================================================================
// RFI — Open Raise ranges by position (default fold for hands not listed)
// =====================================================================

const rfiUTG = fill({
  // Premium pairs
  AA: R(), KK: R(), QQ: R(), JJ: R(), TT: R(), '99': R(), '88': R(), '77': R(),
  '66': R(), '55': R(), '44': R(), '33': R(), '22': R(),
  // Suited broadways
  AKs: R(), AQs: R(), AJs: R(), ATs: R(),
  KQs: R(), KJs: R(),
  QJs: R(), JTs: R(),
  // Suited connectors
  T9s: R(), '98s': R(),
  // Offsuit broadways
  AKo: R(), AQo: R(), AJo: R(),
  KQo: R(),
});

const rfiHJ = fill({
  ...Object.fromEntries(Object.entries(rfiUTG).filter(([, v]) => v.action === 'raise')),
  A9s: R(), KTs: R(), QTs: R(), J9s: R(), '87s': R(),
  ATo: R(), KJo: R(),
});

const rfiCO = fill({
  ...Object.fromEntries(Object.entries(rfiHJ).filter(([, v]) => v.action === 'raise')),
  A8s: R(), A7s: R(), A6s: R(), A5s: R(), A4s: R(), A3s: R(), A2s: R(),
  K9s: R(), Q9s: R(), J8s: R(), T8s: R(), '97s': R(), '76s': R(), '65s': R(),
  A9o: R(), KTo: R(), QJo: R(),
});

const rfiBTN = fill({
  ...Object.fromEntries(Object.entries(rfiCO).filter(([, v]) => v.action === 'raise')),
  K8s: R(), K7s: R(), K6s: R(), K5s: R(), K4s: R(), K3s: R(), K2s: R(),
  Q8s: R(), Q7s: R(), Q6s: R(), Q5s: R(), Q4s: R(), Q3s: R(), Q2s: R(),
  J7s: R(), T7s: R(), '96s': R(), '86s': R(), '75s': R(), '64s': R(), '54s': R(),
  A8o: R(), A7o: R(), A6o: R(), A5o: R(), A4o: R(), A3o: R(), A2o: R(),
  K9o: R(), QTo: R(), J9o: R(), T9o: R(),
});

const rfiSB = fill({
  ...Object.fromEntries(Object.entries(rfiCO).filter(([, v]) => v.action === 'raise')),
  K8s: R(), K7s: R(), K6s: R(), K5s: R(),
  Q8s: R(), Q7s: R(),
  J7s: R(), T7s: R(), '96s': R(), '86s': R(), '75s': R(), '54s': R(),
  A8o: R(), A7o: R(), A5o: R(), A4o: R(), A3o: R(), A2o: R(),
  K9o: R(), QTo: R(), J9o: R(), T9o: R(),
});

const rfiBB: RangeMap = fill({}); // BB doesn't RFI

const rfi: Record<Position, RangeMap> = {
  UTG: rfiUTG,
  HJ: rfiHJ,
  CO: rfiCO,
  BTN: rfiBTN,
  SB: rfiSB,
  BB: rfiBB,
};

// =====================================================================
// 3-Bet Ranges — hero 3-bets vs opener at given position
// Format: gto3bet[heroPosition][villainPosition]
// =====================================================================

// --- generic builder ---
function build3bet(
  value: string[],
  bluff: string[],
  callHands: string[],
  mixedHands?: Record<string, { action: Action; frequency: number }[]>,
): RangeMap {
  const o: Record<string, HandAction> = {};
  for (const h of value) o[h] = R();
  for (const h of bluff) o[h] = R(100);
  for (const h of callHands) o[h] = C();
  if (mixedHands) {
    for (const [h, acts] of Object.entries(mixedHands)) o[h] = M(acts);
  }
  return fill(o);
}

// 3-bet from each position vs each possible opener
// Only positions behind the opener can 3-bet

const threeBet: Record<Position, Partial<Record<Position, RangeMap>>> = {
  // HJ can 3-bet vs UTG
  HJ: {
    UTG: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s'],
      ['JJ', 'TT', '99', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s'],
      { AQo: [{ action: 'raise', frequency: 50 }, { action: 'call', frequency: 50 }] },
    ),
  },
  CO: {
    UTG: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s'],
      ['JJ', 'TT', '99', 'AQs', 'AJs', 'KQs', 'QJs', 'JTs', 'T9s', '98s'],
      { AQo: [{ action: 'raise', frequency: 40 }, { action: 'call', frequency: 60 }] },
    ),
    HJ: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s', 'A3s'],
      ['JJ', 'TT', '99', '88', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s'],
      { AQo: [{ action: 'raise', frequency: 50 }, { action: 'call', frequency: 50 }] },
    ),
  },
  BTN: {
    UTG: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s', 'A3s'],
      ['JJ', 'TT', '99', '88', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s', '87s'],
    ),
    HJ: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s', 'A3s', 'A2s', 'K9s'],
      ['JJ', 'TT', '99', '88', '77', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s'],
      { AQo: [{ action: 'raise', frequency: 60 }, { action: 'call', frequency: 40 }] },
    ),
    CO: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', 'K4s', '76s', '65s'],
      ['JJ', 'TT', '99', '88', '77', '66', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s'],
      {
        AQo: [{ action: 'raise', frequency: 70 }, { action: 'call', frequency: 30 }],
        AJo: [{ action: 'raise', frequency: 40 }, { action: 'call', frequency: 60 }],
      },
    ),
  },
  SB: {
    UTG: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s'],
      ['JJ', 'TT', '99', 'AQs', 'AJs', 'KQs'],
    ),
    HJ: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s', 'A3s'],
      ['JJ', 'TT', '99', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs'],
    ),
    CO: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo', 'AQs'],
      ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', '76s'],
      ['JJ', 'TT', '99', '88', 'AJs', 'ATs', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s'],
    ),
    BTN: build3bet(
      ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
      ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', 'K4s', 'K3s', '76s', '65s', '54s', 'Q8s'],
      ['TT', '99', '88', '77', '66', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s'],
      {
        AQo: [{ action: 'raise', frequency: 80 }, { action: 'call', frequency: 20 }],
        AJo: [{ action: 'raise', frequency: 50 }, { action: 'call', frequency: 50 }],
        KQo: [{ action: 'raise', frequency: 60 }, { action: 'call', frequency: 40 }],
      },
    ),
  },
  BB: {
    UTG: build3bet(
      ['AA', 'KK', 'QQ', 'AKs'],
      ['A5s', 'A4s'],
      ['JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
       'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A3s', 'A2s',
       'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s',
       'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo'],
    ),
    HJ: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
      ['A5s', 'A4s', 'A3s', '76s'],
      ['JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
       'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A2s',
       'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '65s', '54s',
       'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo'],
    ),
    CO: build3bet(
      ['AA', 'KK', 'QQ', 'AKs', 'AKo', 'AQs'],
      ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', '76s', '65s'],
      ['JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
       'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s',
       'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '54s',
       'AQo', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'J9o', 'T9o'],
    ),
    BTN: build3bet(
      ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
      ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', 'K4s', 'K3s', 'K2s', 'Q6s', 'Q5s', '76s', '65s', '54s', '86s'],
      ['TT', '99', '88', '77', '66', '55', '44', '33', '22',
       'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s',
       'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s',
       'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q4s', 'Q3s', 'Q2s',
       'JTs', 'J9s', 'J8s', 'J7s', 'T9s', 'T8s', 'T7s', '98s', '97s', '96s', '87s', '75s', '64s',
       'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
       'KQo', 'KJo', 'KTo', 'K9o', 'QJo', 'QTo', 'Q9o', 'J9o', 'JTo', 'T9o', 'T8o', '98o'],
    ),
    SB: build3bet(
      ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo'],
      ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', 'K4s', 'K3s', 'K2s', 'Q6s', 'Q5s', 'Q4s', '76s', '65s', '54s', '86s', '75s'],
      ['99', '88', '77', '66', '55', '44', '33', '22',
       'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s',
       'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s',
       'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q3s', 'Q2s',
       'JTs', 'J9s', 'J8s', 'J7s', 'T9s', 'T8s', 'T7s', '98s', '97s', '96s', '87s', '64s',
       'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
       'KQo', 'KJo', 'KTo', 'K9o', 'QJo', 'QTo', 'Q9o', 'J9o', 'JTo', 'T9o', 'T8o', '98o', '97o', '87o'],
    ),
  },
  UTG: {}, // UTG can't 3-bet an opener ahead of them
};

// =====================================================================
// vs 3-Bet — how opener responds when facing a 3-bet
// vs3bet[heroPosition][villainPosition (3-bettor)]
// Actions: raise = 4-bet, call, fold
// =====================================================================

function buildVs3bet(
  fourBetValue: string[],
  fourBetBluff: string[],
  callHands: string[],
  mixedHands?: Record<string, { action: Action; frequency: number }[]>,
): RangeMap {
  const o: Record<string, HandAction> = {};
  for (const h of fourBetValue) o[h] = R(); // 4-bet = raise
  for (const h of fourBetBluff) o[h] = R(100);
  for (const h of callHands) o[h] = C();
  if (mixedHands) {
    for (const [h, acts] of Object.entries(mixedHands)) o[h] = M(acts);
  }
  return fill(o);
}

const vs3bet: Record<Position, Partial<Record<Position, RangeMap>>> = {
  UTG: {
    HJ: buildVs3bet(
      ['AA', 'KK'],
      ['A5s'],
      ['QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AJs', 'KQs'],
      { QQ: [{ action: 'raise', frequency: 50 }, { action: 'call', frequency: 50 }] },
    ),
    CO: buildVs3bet(
      ['AA', 'KK'],
      ['A5s'],
      ['QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AJs', 'KQs'],
    ),
    BTN: buildVs3bet(
      ['AA', 'KK'],
      ['A5s', 'A4s'],
      ['QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AJs', 'KQs', 'KJs'],
      { QQ: [{ action: 'raise', frequency: 40 }, { action: 'call', frequency: 60 }] },
    ),
    SB: buildVs3bet(
      ['AA', 'KK'],
      ['A5s'],
      ['QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AJs', 'KQs'],
    ),
    BB: buildVs3bet(
      ['AA', 'KK'],
      ['A5s'],
      ['QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AJs', 'KQs'],
    ),
  },
  HJ: {
    CO: buildVs3bet(
      ['AA', 'KK', 'QQ'],
      ['A5s', 'A4s'],
      ['JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs'],
    ),
    BTN: buildVs3bet(
      ['AA', 'KK', 'QQ'],
      ['A5s', 'A4s'],
      ['JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs'],
    ),
    SB: buildVs3bet(
      ['AA', 'KK'],
      ['A5s'],
      ['QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AJs', 'KQs'],
    ),
    BB: buildVs3bet(
      ['AA', 'KK'],
      ['A5s'],
      ['QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AJs', 'ATs', 'KQs'],
    ),
  },
  CO: {
    BTN: buildVs3bet(
      ['AA', 'KK', 'QQ'],
      ['A5s', 'A4s', 'A3s'],
      ['JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs'],
    ),
    SB: buildVs3bet(
      ['AA', 'KK'],
      ['A5s', 'A4s'],
      ['QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs'],
    ),
    BB: buildVs3bet(
      ['AA', 'KK'],
      ['A5s', 'A4s'],
      ['QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs'],
    ),
  },
  BTN: {
    SB: buildVs3bet(
      ['AA', 'KK', 'QQ', 'AKs'],
      ['A5s', 'A4s', 'A3s', 'A2s'],
      ['JJ', 'TT', '99', '88', '77', 'AKo', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'JTs', 'J9s', 'T9s', '98s', '87s'],
    ),
    BB: buildVs3bet(
      ['AA', 'KK', 'QQ', 'AKs'],
      ['A5s', 'A4s', 'A3s'],
      ['JJ', 'TT', '99', '88', '77', 'AKo', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s'],
    ),
  },
  SB: {
    BB: buildVs3bet(
      ['AA', 'KK', 'QQ', 'AKs'],
      ['A5s', 'A4s', 'A3s', 'A2s'],
      ['JJ', 'TT', '99', '88', '77', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s'],
    ),
  },
  BB: {},
};

// =====================================================================
// 4-Bet Ranges — hero 4-bets vs a 3-bettor
// 4bet[heroPosition][villainPosition]
// =====================================================================

function build4bet(
  fourBetValue: string[],
  fourBetBluff: string[],
  callHands: string[],
): RangeMap {
  const o: Record<string, HandAction> = {};
  for (const h of fourBetValue) o[h] = R();
  for (const h of fourBetBluff) o[h] = R(100);
  for (const h of callHands) o[h] = C();
  return fill(o);
}

const fourBet: Record<Position, Partial<Record<Position, RangeMap>>> = {
  UTG: {}, // same as vs3bet raise hands, but format kept parallel
  HJ: {
    UTG: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s'], ['JJ', 'TT', 'AKo', 'AQs']),
  },
  CO: {
    UTG: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s'], ['JJ', 'TT', 'AKo', 'AQs']),
    HJ: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s', 'A4s'], ['JJ', 'TT', 'AKo', 'AQs']),
  },
  BTN: {
    UTG: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s', 'A4s'], ['JJ', 'TT', 'AKo', 'AQs']),
    HJ: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s', 'A4s', 'A3s'], ['JJ', 'TT', 'AKo', 'AQs', 'AJs']),
    CO: build4bet(['AA', 'KK', 'QQ', 'AKs', 'AKo'], ['A5s', 'A4s', 'A3s', 'A2s'], ['JJ', 'TT', '99', 'AQs', 'AJs', 'KQs']),
  },
  SB: {
    UTG: build4bet(['AA', 'KK'], ['A5s'], ['QQ', 'AKs', 'AKo']),
    HJ: build4bet(['AA', 'KK', 'QQ'], ['A5s'], ['AKs', 'AKo', 'AQs']),
    CO: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s', 'A4s'], ['JJ', 'AKo', 'AQs']),
    BTN: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s', 'A4s', 'A3s', 'A2s'], ['JJ', 'TT', 'AKo', 'AQs', 'AJs']),
  },
  BB: {
    UTG: build4bet(['AA', 'KK'], ['A5s'], ['QQ', 'AKs', 'AKo']),
    HJ: build4bet(['AA', 'KK'], ['A5s'], ['QQ', 'AKs', 'AKo', 'AQs']),
    CO: build4bet(['AA', 'KK', 'QQ'], ['A5s', 'A4s'], ['AKs', 'AKo', 'AQs']),
    BTN: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s', 'A4s', 'A3s'], ['JJ', 'TT', 'AKo', 'AQs']),
    SB: build4bet(['AA', 'KK', 'QQ', 'AKs'], ['A5s', 'A4s', 'A3s', 'A2s'], ['JJ', 'TT', 'AKo', 'AQs', 'AJs']),
  },
};

// =====================================================================
// vs 4-Bet — how 3-bettor responds to a 4-bet
// Actions: raise = 5-bet allin, call, fold
// =====================================================================

function buildVs4bet(
  fiveBet: string[],
  callHands: string[],
  mixedHands?: Record<string, { action: Action; frequency: number }[]>,
): RangeMap {
  const o: Record<string, HandAction> = {};
  for (const h of fiveBet) o[h] = A(); // 5-bet = allin
  for (const h of callHands) o[h] = C();
  if (mixedHands) {
    for (const [h, acts] of Object.entries(mixedHands)) o[h] = M(acts);
  }
  return fill(o);
}

const vs4bet: Record<Position, Partial<Record<Position, RangeMap>>> = {
  // Hero 3-bet, villain 4-bet. Hero position = 3-bettor, villain = 4-bettor (original opener)
  HJ: {
    UTG: buildVs4bet(
      ['AA', 'KK'],
      ['QQ', 'AKs'],
      { AKo: [{ action: 'call', frequency: 60 }, { action: 'fold', frequency: 40 }] },
    ),
  },
  CO: {
    UTG: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs']),
    HJ: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs', 'AKo']),
  },
  BTN: {
    UTG: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs']),
    HJ: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs', 'AKo']),
    CO: buildVs4bet(
      ['AA', 'KK'],
      ['QQ', 'JJ', 'AKs', 'AKo'],
      { QQ: [{ action: 'allin', frequency: 40 }, { action: 'call', frequency: 60 }] },
    ),
  },
  SB: {
    UTG: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs']),
    HJ: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs']),
    CO: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs', 'AKo']),
    BTN: buildVs4bet(
      ['AA', 'KK', 'QQ'],
      ['AKs', 'AKo'],
      { QQ: [{ action: 'allin', frequency: 50 }, { action: 'call', frequency: 50 }] },
    ),
  },
  BB: {
    UTG: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs']),
    HJ: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs']),
    CO: buildVs4bet(['AA', 'KK'], ['QQ', 'AKs', 'AKo']),
    BTN: buildVs4bet(['AA', 'KK', 'QQ'], ['AKs', 'AKo']),
    SB: buildVs4bet(
      ['AA', 'KK', 'QQ'],
      ['JJ', 'AKs', 'AKo'],
      { AKo: [{ action: 'allin', frequency: 30 }, { action: 'call', frequency: 70 }] },
    ),
  },
  UTG: {},
};

// =====================================================================
// 5-Bet All-in — what to shove with facing a 4-bet
// (Essentially the same as the "allin" entries in vs4bet, but presented
//  as its own scenario for clarity.)
// =====================================================================

function build5bet(
  shove: string[],
  mixedHands?: Record<string, { action: Action; frequency: number }[]>,
): RangeMap {
  const o: Record<string, HandAction> = {};
  for (const h of shove) o[h] = A();
  if (mixedHands) {
    for (const [h, acts] of Object.entries(mixedHands)) o[h] = M(acts);
  }
  return fill(o);
}

const fiveBet: Record<Position, Partial<Record<Position, RangeMap>>> = {
  HJ: {
    UTG: build5bet(['AA', 'KK']),
  },
  CO: {
    UTG: build5bet(['AA', 'KK']),
    HJ: build5bet(['AA', 'KK']),
  },
  BTN: {
    UTG: build5bet(['AA', 'KK']),
    HJ: build5bet(['AA', 'KK']),
    CO: build5bet(['AA', 'KK'], { QQ: [{ action: 'allin', frequency: 40 }, { action: 'fold', frequency: 60 }] }),
  },
  SB: {
    UTG: build5bet(['AA', 'KK']),
    HJ: build5bet(['AA', 'KK']),
    CO: build5bet(['AA', 'KK']),
    BTN: build5bet(['AA', 'KK', 'QQ']),
  },
  BB: {
    UTG: build5bet(['AA', 'KK']),
    HJ: build5bet(['AA', 'KK']),
    CO: build5bet(['AA', 'KK']),
    BTN: build5bet(['AA', 'KK', 'QQ']),
    SB: build5bet(['AA', 'KK', 'QQ'], { AKs: [{ action: 'allin', frequency: 50 }, { action: 'fold', frequency: 50 }] }),
  },
  UTG: {},
};

// =====================================================================
// Public accessor
// =====================================================================

export type GTODataStore = Record<
  Scenario,
  Record<Position, Partial<Record<Position, RangeMap>>>
>;

export const gtoData: GTODataStore = {
  rfi: {
    UTG: { UTG: rfi.UTG },
    HJ: { HJ: rfi.HJ },
    CO: { CO: rfi.CO },
    BTN: { BTN: rfi.BTN },
    SB: { SB: rfi.SB },
    BB: { BB: rfi.BB },
  },
  '3bet': threeBet,
  vs3bet: vs3bet,
  '4bet': fourBet,
  vs4bet: vs4bet,
  '5bet': fiveBet,
};

/** Get the range map for a scenario + positions.
 *  Returns null if the combo is not valid. */
export function getRange(
  scenario: Scenario,
  hero: Position,
  villain: Position,
): RangeMap | null {
  return gtoData[scenario]?.[hero]?.[villain] ?? null;
}

/** Get list of valid villain positions for a scenario + hero */
export function getVillainPositions(scenario: Scenario, hero: Position): Position[] {
  const sub = gtoData[scenario]?.[hero];
  if (!sub) return [];
  return POSITIONS.filter((p) => p in sub);
}

/** Does this scenario need a villain selector? */
export function needsVillain(scenario: Scenario): boolean {
  return scenario !== 'rfi';
}
