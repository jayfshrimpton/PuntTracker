import { format, subDays } from 'date-fns';
import type { BetInput } from '@/lib/api';

const DEMO_COUNT = 8;

/** Rows suitable for Supabase insert (no user_id). Dates are relative to `today`. */
export function buildDemoBetRows(today: Date = new Date()): BetInput[] {
  const iso = (daysAgo: number) => format(subDays(today, daysAgo), 'yyyy-MM-dd');

  return [
    {
      race_name: 'Flemington R7',
      horse_name: 'Speed Demon',
      bet_type: 'win',
      price: 4.5,
      stake: 50,
      finishing_position: 1,
      profit_loss: 175,
      bet_date: iso(2),
      venue: 'Flemington',
      race_number: 7,
    },
    {
      race_name: 'Randwick R5',
      horse_name: 'Coastal Haze',
      bet_type: 'place',
      price: 2.8,
      stake: 30,
      finishing_position: 3,
      profit_loss: 54,
      bet_date: iso(4),
      venue: 'Randwick',
      race_number: 5,
    },
    {
      race_name: 'Caulfield R3',
      horse_name: 'Rough Jewel',
      bet_type: 'win',
      price: 12,
      stake: 20,
      finishing_position: null,
      profit_loss: -20,
      bet_date: iso(6),
      venue: 'Caulfield',
      race_number: 3,
    },
    {
      race_name: 'Eagle Farm R6',
      horse_name: 'Northern Bolt',
      bet_type: 'each-way',
      price: 8,
      stake: 40,
      finishing_position: 2,
      profit_loss: 120,
      bet_date: iso(9),
      venue: 'Eagle Farm',
      race_number: 6,
    },
    {
      race_name: 'Morphettville R4',
      horse_name: 'Quinella Box',
      bet_type: 'quinella',
      price: 15,
      stake: 15,
      finishing_position: 1,
      profit_loss: 180,
      bet_date: iso(11),
      venue: 'Morphettville',
      race_number: 4,
      exotic_numbers: '3,7',
    },
    {
      race_name: 'Rosehill R8',
      horse_name: 'Lay Pro',
      bet_type: 'lay',
      price: 3.5,
      stake: 60,
      finishing_position: 1,
      profit_loss: -150,
      bet_date: iso(14),
      venue: 'Rosehill',
      race_number: 8,
    },
    {
      race_name: 'Sandown R2',
      horse_name: 'Multi Leg A',
      bet_type: 'multi',
      price: 6,
      stake: 25,
      finishing_position: null,
      profit_loss: 125,
      bet_date: iso(18),
      venue: 'Sandown',
      race_number: 2,
      description: '2-leg multi',
    },
    {
      race_name: 'Doomben R9',
      horse_name: 'Other / Tote',
      bet_type: 'other',
      price: 5,
      stake: 40,
      finishing_position: null,
      profit_loss: 60,
      bet_date: iso(22),
      venue: 'Doomben',
      race_number: 9,
    },
  ];
}

export { DEMO_COUNT };
