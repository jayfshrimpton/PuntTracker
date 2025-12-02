/**
 * List of Australian racing tracks/venues
 * Organized by state and racing type for easier selection
 */

export type RacingType = 'thoroughbred' | 'greyhound' | 'harness';

export const AUSTRALIAN_RACE_TRACKS = [
  // ========== THOROUGHBRED RACING ==========

  // New South Wales - Thoroughbred
  { value: 'randwick', label: 'Randwick', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'rosehill', label: 'Rosehill Gardens', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'warwick-farm', label: 'Warwick Farm', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'canterbury', label: 'Canterbury Park', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'kembla-grange', label: 'Kembla Grange', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'newcastle', label: 'Newcastle', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'gosford', label: 'Gosford', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'hawkesbury', label: 'Hawkesbury', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'wyong', label: 'Wyong', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'kempsey', label: 'Kempsey', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'port-macquarie', label: 'Port Macquarie', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'taree', label: 'Taree', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'coffs-harbour', label: 'Coffs Harbour', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'grafton', label: 'Grafton', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'lismore', label: 'Lismore', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'ballina', label: 'Ballina', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'wagga-wagga', label: 'Wagga Wagga', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'albury', label: 'Albury', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'goulburn', label: 'Goulburn', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'nowra', label: 'Nowra', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'sapphire-coast', label: 'Sapphire Coast', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'gunnedah', label: 'Gunnedah', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'tamworth', label: 'Tamworth', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'armidale', label: 'Armidale', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'moree', label: 'Moree', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'narromine', label: 'Narromine', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'dubbo', label: 'Dubbo', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'orange', label: 'Orange', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'bathurst', label: 'Bathurst', state: 'NSW', type: 'thoroughbred' as RacingType },
  { value: 'mudgee', label: 'Mudgee', state: 'NSW', type: 'thoroughbred' as RacingType },

  // Victoria - Thoroughbred
  { value: 'flemington', label: 'Flemington', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'caulfield', label: 'Caulfield', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'moonee-valley', label: 'Moonee Valley', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'sandown-thoroughbred', label: 'Sandown', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'geelong', label: 'Geelong', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'ballarat', label: 'Ballarat', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'bendigo', label: 'Bendigo', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'werribee', label: 'Werribee', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'cranbourne', label: 'Cranbourne', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'pakenham', label: 'Pakenham', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'moe', label: 'Moe', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'sale', label: 'Sale', state: 'VIC', type: 'thoroughbred' as RacingType },
  { value: 'warrnambool', label: 'Warrnambool', state: 'VIC', type: 'thoroughbred' as RacingType },

  // Queensland - Thoroughbred
  { value: 'eagle-farm', label: 'Eagle Farm', state: 'QLD', type: 'thoroughbred' as RacingType },
  { value: 'doomben', label: 'Doomben', state: 'QLD', type: 'thoroughbred' as RacingType },
  { value: 'sunshine-coast', label: 'Sunshine Coast', state: 'QLD', type: 'thoroughbred' as RacingType },
  { value: 'gold-coast', label: 'Gold Coast', state: 'QLD', type: 'thoroughbred' as RacingType },
  { value: 'ipswich', label: 'Ipswich', state: 'QLD', type: 'thoroughbred' as RacingType },
  { value: 'toowoomba', label: 'Toowoomba', state: 'QLD', type: 'thoroughbred' as RacingType },
  { value: 'cairns', label: 'Cairns', state: 'QLD', type: 'thoroughbred' as RacingType },
  { value: 'townsville', label: 'Townsville', state: 'QLD', type: 'thoroughbred' as RacingType },
  { value: 'rockhampton', label: 'Rockhampton', state: 'QLD', type: 'thoroughbred' as RacingType },

  // South Australia - Thoroughbred
  { value: 'morphettville', label: 'Morphettville', state: 'SA', type: 'thoroughbred' as RacingType },
  { value: 'gawler', label: 'Gawler', state: 'SA', type: 'thoroughbred' as RacingType },
  { value: 'murray-bridge', label: 'Murray Bridge', state: 'SA', type: 'thoroughbred' as RacingType },
  { value: 'port-lincoln', label: 'Port Lincoln', state: 'SA', type: 'thoroughbred' as RacingType },

  // Western Australia - Thoroughbred
  { value: 'ascot', label: 'Ascot', state: 'WA', type: 'thoroughbred' as RacingType },
  { value: 'belmont', label: 'Belmont Park', state: 'WA', type: 'thoroughbred' as RacingType },
  { value: 'pinjarra', label: 'Pinjarra', state: 'WA', type: 'thoroughbred' as RacingType },
  { value: 'bunbury', label: 'Bunbury', state: 'WA', type: 'thoroughbred' as RacingType },
  { value: 'albany', label: 'Albany', state: 'WA', type: 'thoroughbred' as RacingType },
  { value: 'kalgoorlie', label: 'Kalgoorlie', state: 'WA', type: 'thoroughbred' as RacingType },

  // Tasmania - Thoroughbred
  { value: 'elwick', label: 'Elwick', state: 'TAS', type: 'thoroughbred' as RacingType },
  { value: 'launceston', label: 'Launceston', state: 'TAS', type: 'thoroughbred' as RacingType },
  { value: 'devonport', label: 'Devonport', state: 'TAS', type: 'thoroughbred' as RacingType },

  // Northern Territory - Thoroughbred
  { value: 'fannie-bay', label: 'Fannie Bay', state: 'NT', type: 'thoroughbred' as RacingType },
  { value: 'alice-springs', label: 'Alice Springs', state: 'NT', type: 'thoroughbred' as RacingType },

  // ACT - Thoroughbred
  { value: 'canberra', label: 'Canberra', state: 'ACT', type: 'thoroughbred' as RacingType },

  // ========== GREYHOUND RACING ==========

  // New South Wales - Greyhound
  { value: 'wentworth-park', label: 'Wentworth Park', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'richmond-greyhound', label: 'Richmond', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'dapto', label: 'Dapto', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'bulli', label: 'Bulli', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'newcastle-greyhound', label: 'Newcastle', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'gosford-greyhound', label: 'Gosford', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'the-gardens', label: 'The Gardens', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'dubbo-greyhound', label: 'Dubbo', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'wagga-greyhound', label: 'Wagga Wagga', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'bathurst-greyhound', label: 'Bathurst', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'goulburn-greyhound', label: 'Goulburn', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'temora', label: 'Temora', state: 'NSW', type: 'greyhound' as RacingType },
  { value: 'broken-hill-greyhound', label: 'Broken Hill', state: 'NSW', type: 'greyhound' as RacingType },

  // Victoria - Greyhound
  { value: 'the-meadows', label: 'The Meadows', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'sandown-greyhound', label: 'Sandown Park', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'geelong-greyhound', label: 'Geelong', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'warrnambool-greyhound', label: 'Warrnambool', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'ballarat-greyhound', label: 'Ballarat', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'bendigo-greyhound', label: 'Bendigo', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'horsham-greyhound', label: 'Horsham', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'shepparton', label: 'Shepparton', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'sale-greyhound', label: 'Sale', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'traralgon-greyhound', label: 'Traralgon', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'cranbourne-greyhound', label: 'Cranbourne', state: 'VIC', type: 'greyhound' as RacingType },
  { value: 'healesville', label: 'Healesville', state: 'VIC', type: 'greyhound' as RacingType },

  // Queensland - Greyhound
  { value: 'albion-park-greyhound', label: 'Albion Park', state: 'QLD', type: 'greyhound' as RacingType },
  { value: 'ipswich-greyhound', label: 'Ipswich', state: 'QLD', type: 'greyhound' as RacingType },
  { value: 'gold-coast-greyhound', label: 'Gold Coast', state: 'QLD', type: 'greyhound' as RacingType },
  { value: 'capalaba', label: 'Capalaba', state: 'QLD', type: 'greyhound' as RacingType },
  { value: 'townsville-greyhound', label: 'Townsville', state: 'QLD', type: 'greyhound' as RacingType },
  { value: 'rockhampton-greyhound', label: 'Rockhampton', state: 'QLD', type: 'greyhound' as RacingType },
  { value: 'cairns-greyhound', label: 'Cairns', state: 'QLD', type: 'greyhound' as RacingType },
  { value: 'mackay-greyhound', label: 'Mackay', state: 'QLD', type: 'greyhound' as RacingType },
  { value: 'bundaberg-greyhound', label: 'Bundaberg', state: 'QLD', type: 'greyhound' as RacingType },

  // South Australia - Greyhound
  { value: 'angle-park', label: 'Angle Park', state: 'SA', type: 'greyhound' as RacingType },
  { value: 'gawler-greyhound', label: 'Gawler', state: 'SA', type: 'greyhound' as RacingType },
  { value: 'murray-bridge-greyhound', label: 'Murray Bridge', state: 'SA', type: 'greyhound' as RacingType },
  { value: 'mount-gambier-greyhound', label: 'Mount Gambier', state: 'SA', type: 'greyhound' as RacingType },

  // Western Australia - Greyhound
  { value: 'cannington', label: 'Cannington', state: 'WA', type: 'greyhound' as RacingType },
  { value: 'mandurah-greyhound', label: 'Mandurah', state: 'WA', type: 'greyhound' as RacingType },

  // Tasmania - Greyhound
  { value: 'hobart-greyhound', label: 'Hobart', state: 'TAS', type: 'greyhound' as RacingType },
  { value: 'launceston-greyhound', label: 'Launceston', state: 'TAS', type: 'greyhound' as RacingType },
  { value: 'devonport-greyhound', label: 'Devonport', state: 'TAS', type: 'greyhound' as RacingType },

  // Northern Territory - Greyhound
  { value: 'fannie-bay-greyhound', label: 'Fannie Bay', state: 'NT', type: 'greyhound' as RacingType },

  // ========== HARNESS RACING (TROTS) ==========

  // New South Wales - Harness
  { value: 'menangle', label: 'Menangle', state: 'NSW', type: 'harness' as RacingType },
  { value: 'newcastle-harness', label: 'Newcastle', state: 'NSW', type: 'harness' as RacingType },
  { value: 'bathurst-harness', label: 'Bathurst', state: 'NSW', type: 'harness' as RacingType },
  { value: 'wagga-harness', label: 'Wagga Wagga', state: 'NSW', type: 'harness' as RacingType },
  { value: 'dubbo-harness', label: 'Dubbo', state: 'NSW', type: 'harness' as RacingType },
  { value: 'tamworth-harness', label: 'Tamworth', state: 'NSW', type: 'harness' as RacingType },
  { value: 'bankstown', label: 'Bankstown', state: 'NSW', type: 'harness' as RacingType },
  { value: 'penrith', label: 'Penrith', state: 'NSW', type: 'harness' as RacingType },

  // Victoria - Harness
  { value: 'tabcorp-park-melton', label: 'Tabcorp Park Melton', state: 'VIC', type: 'harness' as RacingType },
  { value: 'tabcorp-park-melb', label: 'Tabcorp Park Melbourne', state: 'VIC', type: 'harness' as RacingType },
  { value: 'geelong-harness', label: 'Geelong', state: 'VIC', type: 'harness' as RacingType },
  { value: 'ballarat-harness', label: 'Ballarat', state: 'VIC', type: 'harness' as RacingType },
  { value: 'bendigo-harness', label: 'Bendigo', state: 'VIC', type: 'harness' as RacingType },
  { value: 'shepparton-harness', label: 'Shepparton', state: 'VIC', type: 'harness' as RacingType },
  { value: 'maryborough-harness', label: 'Maryborough', state: 'VIC', type: 'harness' as RacingType },
  { value: 'warrnambool-harness', label: 'Warrnambool', state: 'VIC', type: 'harness' as RacingType },
  { value: 'cranbourne-harness', label: 'Cranbourne', state: 'VIC', type: 'harness' as RacingType },

  // Queensland - Harness
  { value: 'albion-park-harness', label: 'Albion Park', state: 'QLD', type: 'harness' as RacingType },
  { value: 'redcliffe', label: 'Redcliffe', state: 'QLD', type: 'harness' as RacingType },
  { value: 'marburg', label: 'Marburg', state: 'QLD', type: 'harness' as RacingType },
  { value: 'townsville-harness', label: 'Townsville', state: 'QLD', type: 'harness' as RacingType },
  { value: 'cairns-harness', label: 'Cairns', state: 'QLD', type: 'harness' as RacingType },

  // South Australia - Harness
  { value: 'globe-derby-park', label: 'Globe Derby Park', state: 'SA', type: 'harness' as RacingType },
  { value: 'gawler-harness', label: 'Gawler', state: 'SA', type: 'harness' as RacingType },
  { value: 'port-pirie-harness', label: 'Port Pirie', state: 'SA', type: 'harness' as RacingType },

  // Western Australia - Harness
  { value: 'gloucester-park', label: 'Gloucester Park', state: 'WA', type: 'harness' as RacingType },
  { value: 'pinjarra-harness', label: 'Pinjarra', state: 'WA', type: 'harness' as RacingType },
  { value: 'bunbury-harness', label: 'Bunbury', state: 'WA', type: 'harness' as RacingType },
  { value: 'northam-harness', label: 'Northam', state: 'WA', type: 'harness' as RacingType },

  // Tasmania - Harness
  { value: 'hobart-harness', label: 'Hobart', state: 'TAS', type: 'harness' as RacingType },
  { value: 'launceston-harness', label: 'Launceston', state: 'TAS', type: 'harness' as RacingType },
  { value: 'devonport-harness', label: 'Devonport', state: 'TAS', type: 'harness' as RacingType },

  // Northern Territory - Harness
  { value: 'darwin-harness', label: 'Darwin', state: 'NT', type: 'harness' as RacingType },
] as const;


export type TrackValue = typeof AUSTRALIAN_RACE_TRACKS[number]['value'];

/**
 * Get tracks grouped by state
 */
export function getTracksByState() {
  const grouped: Record<string, typeof AUSTRALIAN_RACE_TRACKS[number][]> = {};
  AUSTRALIAN_RACE_TRACKS.forEach((track) => {
    if (!grouped[track.state]) {
      grouped[track.state] = [];
    }
    grouped[track.state].push(track);
  });
  return grouped;
}

/**
 * Get tracks grouped by racing type
 */
export function getTracksByType() {
  const grouped: Record<RacingType, typeof AUSTRALIAN_RACE_TRACKS[number][]> = {
    thoroughbred: [],
    greyhound: [],
    harness: [],
  };
  AUSTRALIAN_RACE_TRACKS.forEach((track) => {
    grouped[track.type].push(track);
  });
  return grouped;
}

/**
 * Get tracks filtered by racing type
 */
export function getTracksByRacingType(type: RacingType | null) {
  if (!type) return AUSTRALIAN_RACE_TRACKS;
  return AUSTRALIAN_RACE_TRACKS.filter((track) => track.type === type);
}

/**
 * Get track label by value
 */
export function getTrackLabel(value: string | null | undefined): string {
  if (!value) return '';
  const track = AUSTRALIAN_RACE_TRACKS.find((t) => t.value === value);
  return track ? track.label : value;
}

/**
 * Get track type by value
 */
export function getTrackType(value: string | null | undefined): RacingType | null {
  if (!value) return null;
  const track = AUSTRALIAN_RACE_TRACKS.find((t) => t.value === value);
  return track ? track.type : null;
}

/**
 * Get racing type display name
 */
export function getRacingTypeLabel(type: RacingType): string {
  const labels: Record<RacingType, string> = {
    thoroughbred: 'Thoroughbred',
    greyhound: 'Greyhound',
    harness: 'Harness (Trots)',
  };
  return labels[type];
}

/**
 * Get racing type icon emoji
 */
export function getRacingTypeIcon(type: RacingType): string {
  const icons: Record<RacingType, string> = {
    thoroughbred: '🐴',
    greyhound: '🐕',
    harness: '🏇',
  };
  return icons[type];
}


