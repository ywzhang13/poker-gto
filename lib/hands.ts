export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export type Rank = (typeof RANKS)[number];

export type HandType = 'pair' | 'suited' | 'offsuit';

export interface Hand {
  name: string;
  row: number;
  col: number;
  type: HandType;
  rank1: Rank;
  rank2: Rank;
}

/** Build the 13x13 hand matrix. Row = first card, Col = second card.
 *  Upper-right triangle = suited, lower-left = offsuit, diagonal = pairs. */
export function buildMatrix(): Hand[][] {
  const matrix: Hand[][] = [];
  for (let r = 0; r < 13; r++) {
    const row: Hand[] = [];
    for (let c = 0; c < 13; c++) {
      const r1 = RANKS[r];
      const r2 = RANKS[c];
      let name: string;
      let type: HandType;
      if (r === c) {
        name = `${r1}${r2}`;
        type = 'pair';
      } else if (c > r) {
        // upper-right = suited
        name = `${r1}${r2}s`;
        type = 'suited';
      } else {
        // lower-left = offsuit
        name = `${r2}${r1}o`;
        type = 'offsuit';
      }
      row.push({ name, row: r, col: c, type, rank1: r1, rank2: r2 });
    }
    matrix.push(row);
  }
  return matrix;
}

/** All 169 unique starting hand names */
export function allHandNames(): string[] {
  const hands: string[] = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const r1 = RANKS[r];
      const r2 = RANKS[c];
      if (r === c) hands.push(`${r1}${r2}`);
      else if (c > r) hands.push(`${r1}${r2}s`);
      else hands.push(`${r2}${r1}o`);
    }
  }
  return hands;
}

/** Number of combos for a hand type */
export function combos(hand: string): number {
  if (hand.length === 2) return 6; // pair
  if (hand.endsWith('s')) return 4; // suited
  return 12; // offsuit
}
