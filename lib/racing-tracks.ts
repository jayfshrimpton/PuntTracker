/**
 * Comprehensive list of racing tracks/venues
 * Includes Australian tracks (all types) and popular international venues
 */

export type RacingType = 'thoroughbred' | 'greyhound' | 'harness';
export type Country = 'AUS' | 'NZ' | 'UK' | 'IRE' | 'USA' | 'HK' | 'SG' | 'JP' | 'UAE' | 'FR';

export interface RaceTrack {
    value: string;
    label: string;
    state?: string;  // For Australian tracks
    country: Country;
    type: RacingType;
}

export const RACE_TRACKS: RaceTrack[] = [
    // ========== AUSTRALIA - THOROUGHBRED ==========

    // New South Wales - Thoroughbred
    { value: 'randwick', label: 'Randwick', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'rosehill', label: 'Rosehill Gardens', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'warwick-farm', label: 'Warwick Farm', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'canterbury', label: 'Canterbury Park', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'kembla-grange', label: 'Kembla Grange', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'newcastle', label: 'Newcastle', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'gosford', label: 'Gosford', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'hawkesbury', label: 'Hawkesbury', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'wyong', label: 'Wyong', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'kempsey', label: 'Kempsey', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'port-macquarie', label: 'Port Macquarie', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'taree', label: 'Taree', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'coffs-harbour', label: 'Coffs Harbour', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'grafton', label: 'Grafton', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'lismore', label: 'Lismore', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'ballina', label: 'Ballina', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'wagga-wagga', label: 'Wagga Wagga', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'albury', label: 'Albury', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'goulburn', label: 'Goulburn', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'nowra', label: 'Nowra', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'sapphire-coast', label: 'Sapphire Coast', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'gunnedah', label: 'Gunnedah', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'tamworth', label: 'Tamworth', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'armidale', label: 'Armidale', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'moree', label: 'Moree', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'narromine', label: 'Narromine', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'dubbo', label: 'Dubbo', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'orange', label: 'Orange', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'bathurst', label: 'Bathurst', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'mudgee', label: 'Mudgee', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'scone', label: 'Scone', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'muswellbrook', label: 'Muswellbrook', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'cessnock', label: 'Cessnock', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'gilgandra', label: 'Gilgandra', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'wellington', label: 'Wellington', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'cowra', label: 'Cowra', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'young', label: 'Young', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'cootamundra', label: 'Cootamundra', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'queanbeyan', label: 'Queanbeyan', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'bega', label: 'Bega', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'moruya', label: 'Moruya', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'inverell', label: 'Inverell', state: 'NSW', country: 'AUS', type: 'thoroughbred' },
    { value: 'glen-innes', label: 'Glen Innes', state: 'NSW', country: 'AUS', type: 'thoroughbred' },

    // Victoria - Thoroughbred
    { value: 'flemington', label: 'Flemington', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'caulfield', label: 'Caulfield', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'moonee-valley', label: 'Moonee Valley', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'sandown-thoroughbred', label: 'Sandown', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'geelong', label: 'Geelong', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'ballarat', label: 'Ballarat', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'bendigo', label: 'Bendigo', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'werribee', label: 'Werribee', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'cranbourne', label: 'Cranbourne', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'pakenham', label: 'Pakenham', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'moe', label: 'Moe', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'sale', label: 'Sale', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'warrnambool', label: 'Warrnambool', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'hamilton', label: 'Hamilton', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'echuca', label: 'Echuca', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'swan-hill', label: 'Swan Hill', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'mildura', label: 'Mildura', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'wangaratta', label: 'Wangaratta', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'kilmore', label: 'Kilmore', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'kyneton', label: 'Kyneton', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'ararat', label: 'Ararat', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'stawell', label: 'Stawell', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'horsham', label: 'Horsham', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'colac', label: 'Colac', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'donald', label: 'Donald', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'seymour', label: 'Seymour', state: 'VIC', country: 'AUS', type: 'thoroughbred' },
    { value: 'yarra-valley', label: 'Yarra Valley', state: 'VIC', country: 'AUS', type: 'thoroughbred' },

    // Queensland - Thoroughbred
    { value: 'eagle-farm', label: 'Eagle Farm', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'doomben', label: 'Doomben', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'sunshine-coast', label: 'Sunshine Coast', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'gold-coast', label: 'Gold Coast', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'ipswich', label: 'Ipswich', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'toowoomba', label: 'Toowoomba', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'cairns', label: 'Cairns', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'townsville', label: 'Townsville', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'rockhampton', label: 'Rockhampton', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'mackay', label: 'Mackay', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'bundaberg', label: 'Bundaberg', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'gladstone', label: 'Gladstone', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'emerald', label: 'Emerald', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'longreach', label: 'Longreach', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'mount-isa', label: 'Mount Isa', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'charleville', label: 'Charleville', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'roma', label: 'Roma', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'dalby', label: 'Dalby', state: 'QLD', country: 'AUS', type: 'thoroughbred' },
    { value: 'warwick-qld', label: 'Warwick', state: 'QLD', country: 'AUS', type: 'thoroughbred' },

    // South Australia - Thoroughbred
    { value: 'morphettville', label: 'Morphettville', state: 'SA', country: 'AUS', type: 'thoroughbred' },
    { value: 'gawler', label: 'Gawler', state: 'SA', country: 'AUS', type: 'thoroughbred' },
    { value: 'murray-bridge', label: 'Murray Bridge', state: 'SA', country: 'AUS', type: 'thoroughbred' },
    { value: 'port-lincoln', label: 'Port Lincoln', state: 'SA', country: 'AUS', type: 'thoroughbred' },
    { value: 'mount-gambier', label: 'Mount Gambier', state: 'SA', country: 'AUS', type: 'thoroughbred' },
    { value: 'port-augusta', label: 'Port Augusta', state: 'SA', country: 'AUS', type: 'thoroughbred' },
    { value: 'strathalbyn', label: 'Strathalbyn', state: 'SA', country: 'AUS', type: 'thoroughbred' },

    // Western Australia - Thoroughbred
    { value: 'ascot', label: 'Ascot', state: 'WA', country: 'AUS', type: 'thoroughbred' },
    { value: 'belmont', label: 'Belmont Park', state: 'WA', country: 'AUS', type: 'thoroughbred' },
    { value: 'pinjarra', label: 'Pinjarra', state: 'WA', country: 'AUS', type: 'thoroughbred' },
    { value: 'bunbury', label: 'Bunbury', state: 'WA', country: 'AUS', type: 'thoroughbred' },
    { value: 'albany', label: 'Albany', state: 'WA', country: 'AUS', type: 'thoroughbred' },
    { value: 'kalgoorlie', label: 'Kalgoorlie', state: 'WA', country: 'AUS', type: 'thoroughbred' },
    { value: 'geraldton', label: 'Geraldton', state: 'WA', country: 'AUS', type: 'thoroughbred' },
    { value: 'northam', label: 'Northam', state: 'WA', country: 'AUS', type: 'thoroughbred' },

    // Tasmania - Thoroughbred
    { value: 'elwick', label: 'Elwick', state: 'TAS', country: 'AUS', type: 'thoroughbred' },
    { value: 'launceston', label: 'Launceston', state: 'TAS', country: 'AUS', type: 'thoroughbred' },
    { value: 'devonport', label: 'Devonport', state: 'TAS', country: 'AUS', type: 'thoroughbred' },
    { value: 'burnie', label: 'Burnie', state: 'TAS', country: 'AUS', type: 'thoroughbred' },

    // Northern Territory - Thoroughbred
    { value: 'fannie-bay', label: 'Fannie Bay', state: 'NT', country: 'AUS', type: 'thoroughbred' },
    { value: 'alice-springs', label: 'Alice Springs', state: 'NT', country: 'AUS', type: 'thoroughbred' },

    // ACT - Thoroughbred
    { value: 'canberra', label: 'Canberra', state: 'ACT', country: 'AUS', type: 'thoroughbred' },

    // ========== AUSTRALIA - GREYHOUND ==========

    // New South Wales - Greyhound
    { value: 'wentworth-park', label: 'Wentworth Park', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'richmond-greyhound', label: 'Richmond', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'dapto', label: 'Dapto', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'bulli', label: 'Bulli', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'newcastle-greyhound', label: 'Newcastle', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'gosford-greyhound', label: 'Gosford', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'the-gardens', label: 'The Gardens', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'dubbo-greyhound', label: 'Dubbo', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'wagga-greyhound', label: 'Wagga Wagga', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'bathurst-greyhound', label: 'Bathurst', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'goulburn-greyhound', label: 'Goulburn', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'temora', label: 'Temora', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'broken-hill-greyhound', label: 'Broken Hill', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'lismore-greyhound', label: 'Lismore', state: 'NSW', country: 'AUS', type: 'greyhound' },
    { value: 'grafton-greyhound', label: 'Grafton', state: 'NSW', country: 'AUS', type: 'greyhound' },

    // Victoria - Greyhound
    { value: 'the-meadows', label: 'The Meadows', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'sandown-greyhound', label: 'Sandown Park', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'geelong-greyhound', label: 'Geelong', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'warrnambool-greyhound', label: 'Warrnambool', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'ballarat-greyhound', label: 'Ballarat', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'bendigo-greyhound', label: 'Bendigo', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'horsham-greyhound', label: 'Horsham', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'shepparton', label: 'Shepparton', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'sale-greyhound', label: 'Sale', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'traralgon-greyhound', label: 'Traralgon', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'cranbourne-greyhound', label: 'Cranbourne', state: 'VIC', country: 'AUS', type: 'greyhound' },
    { value: 'healesville', label: 'Healesville', state: 'VIC', country: 'AUS', type: 'greyhound' },

    // Queensland - Greyhound
    { value: 'albion-park-greyhound', label: 'Albion Park', state: 'QLD', country: 'AUS', type: 'greyhound' },
    { value: 'ipswich-greyhound', label: 'Ipswich', state: 'QLD', country: 'AUS', type: 'greyhound' },
    { value: 'gold-coast-greyhound', label: 'Gold Coast', state: 'QLD', country: 'AUS', type: 'greyhound' },
    { value: 'capalaba', label: 'Capalaba', state: 'QLD', country: 'AUS', type: 'greyhound' },
    { value: 'townsville-greyhound', label: 'Townsville', state: 'QLD', country: 'AUS', type: 'greyhound' },
    { value: 'rockhampton-greyhound', label: 'Rockhampton', state: 'QLD', country: 'AUS', type: 'greyhound' },
    { value: 'cairns-greyhound', label: 'Cairns', state: 'QLD', country: 'AUS', type: 'greyhound' },
    { value: 'mackay-greyhound', label: 'Mackay', state: 'QLD', country: 'AUS', type: 'greyhound' },
    { value: 'bundaberg-greyhound', label: 'Bundaberg', state: 'QLD', country: 'AUS', type: 'greyhound' },

    // South Australia - Greyhound
    { value: 'angle-park', label: 'Angle Park', state: 'SA', country: 'AUS', type: 'greyhound' },
    { value: 'gawler-greyhound', label: 'Gawler', state: 'SA', country: 'AUS', type: 'greyhound' },
    { value: 'murray-bridge-greyhound', label: 'Murray Bridge', state: 'SA', country: 'AUS', type: 'greyhound' },
    { value: 'mount-gambier-greyhound', label: 'Mount Gambier', state: 'SA', country: 'AUS', type: 'greyhound' },

    // Western Australia - Greyhound
    { value: 'cannington', label: 'Cannington', state: 'WA', country: 'AUS', type: 'greyhound' },
    { value: 'mandurah-greyhound', label: 'Mandurah', state: 'WA', country: 'AUS', type: 'greyhound' },

    // Tasmania - Greyhound
    { value: 'hobart-greyhound', label: 'Hobart', state: 'TAS', country: 'AUS', type: 'greyhound' },
    { value: 'launceston-greyhound', label: 'Launceston', state: 'TAS', country: 'AUS', type: 'greyhound' },
    { value: 'devonport-greyhound', label: 'Devonport', state: 'TAS', country: 'AUS', type: 'greyhound' },

    // Northern Territory - Greyhound
    { value: 'fannie-bay-greyhound', label: 'Fannie Bay', state: 'NT', country: 'AUS', type: 'greyhound' },

    // ========== AUSTRALIA - HARNESS ==========

    // New South Wales - Harness
    { value: 'menangle', label: 'Menangle', state: 'NSW', country: 'AUS', type: 'harness' },
    { value: 'newcastle-harness', label: 'Newcastle', state: 'NSW', country: 'AUS', type: 'harness' },
    { value: 'bathurst-harness', label: 'Bathurst', state: 'NSW', country: 'AUS', type: 'harness' },
    { value: 'wagga-harness', label: 'Wagga Wagga', state: 'NSW', country: 'AUS', type: 'harness' },
    { value: 'dubbo-harness', label: 'Dubbo', state: 'NSW', country: 'AUS', type: 'harness' },
    { value: 'tamworth-harness', label: 'Tamworth', state: 'NSW', country: 'AUS', type: 'harness' },
    { value: 'bankstown', label: 'Bankstown', state: 'NSW', country: 'AUS', type: 'harness' },
    { value: 'penrith', label: 'Penrith', state: 'NSW', country: 'AUS', type: 'harness' },

    // Victoria - Harness
    { value: 'tabcorp-park-melton', label: 'Tabcorp Park Melton', state: 'VIC', country: 'AUS', type: 'harness' },
    { value: 'tabcorp-park-melb', label: 'Tabcorp Park Melbourne', state: 'VIC', country: 'AUS', type: 'harness' },
    { value: 'geelong-harness', label: 'Geelong', state: 'VIC', country: 'AUS', type: 'harness' },
    { value: 'ballarat-harness', label: 'Ballarat', state: 'VIC', country: 'AUS', type: 'harness' },
    { value: 'bendigo-harness', label: 'Bendigo', state: 'VIC', country: 'AUS', type: 'harness' },
    { value: 'shepparton-harness', label: 'Shepparton', state: 'VIC', country: 'AUS', type: 'harness' },
    { value: 'maryborough-harness', label: 'Maryborough', state: 'VIC', country: 'AUS', type: 'harness' },
    { value: 'warrnambool-harness', label: 'Warrnambool', state: 'VIC', country: 'AUS', type: 'harness' },
    { value: 'cranbourne-harness', label: 'Cranbourne', state: 'VIC', country: 'AUS', type: 'harness' },

    // Queensland - Harness
    { value: 'albion-park-harness', label: 'Albion Park', state: 'QLD', country: 'AUS', type: 'harness' },
    { value: 'redcliffe', label: 'Redcliffe', state: 'QLD', country: 'AUS', type: 'harness' },
    { value: 'marburg', label: 'Marburg', state: 'QLD', country: 'AUS', type: 'harness' },
    { value: 'townsville-harness', label: 'Townsville', state: 'QLD', country: 'AUS', type: 'harness' },
    { value: 'cairns-harness', label: 'Cairns', state: 'QLD', country: 'AUS', type: 'harness' },

    // South Australia - Harness
    { value: 'globe-derby-park', label: 'Globe Derby Park', state: 'SA', country: 'AUS', type: 'harness' },
    { value: 'gawler-harness', label: 'Gawler', state: 'SA', country: 'AUS', type: 'harness' },
    { value: 'port-pirie-harness', label: 'Port Pirie', state: 'SA', country: 'AUS', type: 'harness' },

    // Western Australia - Harness
    { value: 'gloucester-park', label: 'Gloucester Park', state: 'WA', country: 'AUS', type: 'harness' },
    { value: 'pinjarra-harness', label: 'Pinjarra', state: 'WA', country: 'AUS', type: 'harness' },
    { value: 'bunbury-harness', label: 'Bunbury', state: 'WA', country: 'AUS', type: 'harness' },
    { value: 'northam-harness', label: 'Northam', state: 'WA', country: 'AUS', type: 'harness' },

    // Tasmania - Harness
    { value: 'hobart-harness', label: 'Hobart', state: 'TAS', country: 'AUS', type: 'harness' },
    { value: 'launceston-harness', label: 'Launceston', state: 'TAS', country: 'AUS', type: 'harness' },
    { value: 'devonport-harness', label: 'Devonport', state: 'TAS', country: 'AUS', type: 'harness' },

    // Northern Territory - Harness
    { value: 'darwin-harness', label: 'Darwin', state: 'NT', country: 'AUS', type: 'harness' },

    // ========== NEW ZEALAND ==========

    { value: 'ellerslie', label: 'Ellerslie', country: 'NZ', type: 'thoroughbred' },
    { value: 'trentham', label: 'Trentham', country: 'NZ', type: 'thoroughbred' },
    { value: 'riccarton', label: 'Riccarton', country: 'NZ', type: 'thoroughbred' },
    { value: 'te-rapa', label: 'Te Rapa', country: 'NZ', type: 'thoroughbred' },
    { value: 'awapuni', label: 'Awapuni', country: 'NZ', type: 'thoroughbred' },
    { value: 'hastings-nz', label: 'Hastings', country: 'NZ', type: 'thoroughbred' },
    { value: 'otaki', label: 'Otaki', country: 'NZ', type: 'thoroughbred' },
    { value: 'new-plymouth', label: 'New Plymouth', country: 'NZ', type: 'thoroughbred' },
    { value: 'wanganui', label: 'Wanganui', country: 'NZ', type: 'thoroughbred' },
    { value: 'rotorua', label: 'Rotorua', country: 'NZ', type: 'thoroughbred' },

    // ========== HONG KONG ==========

    { value: 'sha-tin', label: 'Sha Tin', country: 'HK', type: 'thoroughbred' },
    { value: 'happy-valley', label: 'Happy Valley', country: 'HK', type: 'thoroughbred' },

    // ========== SINGAPORE ==========

    { value: 'kranji', label: 'Kranji', country: 'SG', type: 'thoroughbred' },

    // ========== UNITED KINGDOM ==========

    { value: 'ascot-uk', label: 'Ascot', country: 'UK', type: 'thoroughbred' },
    { value: 'cheltenham', label: 'Cheltenham', country: 'UK', type: 'thoroughbred' },
    { value: 'newmarket', label: 'Newmarket', country: 'UK', type: 'thoroughbred' },
    { value: 'epsom-downs', label: 'Epsom Downs', country: 'UK', type: 'thoroughbred' },
    { value: 'goodwood', label: 'Goodwood', country: 'UK', type: 'thoroughbred' },
    { value: 'york-uk', label: 'York', country: 'UK', type: 'thoroughbred' },
    { value: 'doncaster', label: 'Doncaster', country: 'UK', type: 'thoroughbred' },
    { value: 'aintree', label: 'Aintree', country: 'UK', type: 'thoroughbred' },
    { value: 'sandown-park-uk', label: 'Sandown Park', country: 'UK', type: 'thoroughbred' },
    { value: 'kempton-park', label: 'Kempton Park', country: 'UK', type: 'thoroughbred' },
    { value: 'haydock-park', label: 'Haydock Park', country: 'UK', type: 'thoroughbred' },
    { value: 'newbury', label: 'Newbury', country: 'UK', type: 'thoroughbred' },
    { value: 'chester', label: 'Chester', country: 'UK', type: 'thoroughbred' },
    { value: 'royal-windsor', label: 'Royal Windsor', country: 'UK', type: 'thoroughbred' },
    { value: 'lingfield', label: 'Lingfield Park', country: 'UK', type: 'thoroughbred' },
    { value: 'wolverhampton', label: 'Wolverhampton', country: 'UK', type: 'thoroughbred' },
    { value: 'southwell', label: 'Southwell', country: 'UK', type: 'thoroughbred' },
    { value: 'newcastle-uk', label: 'Newcastle', country: 'UK', type: 'thoroughbred' },
    { value: 'ayr', label: 'Ayr', country: 'UK', type: 'thoroughbred' },
    { value: 'hamilton-park', label: 'Hamilton Park', country: 'UK', type: 'thoroughbred' },

    // ========== IRELAND ==========

    { value: 'the-curragh', label: 'The Curragh', country: 'IRE', type: 'thoroughbred' },
    { value: 'leopardstown', label: 'Leopardstown', country: 'IRE', type: 'thoroughbred' },
    { value: 'fairyhouse', label: 'Fairyhouse', country: 'IRE', type: 'thoroughbred' },
    { value: 'punchestown', label: 'Punchestown', country: 'IRE', type: 'thoroughbred' },
    { value: 'galway', label: 'Galway', country: 'IRE', type: 'thoroughbred' },
    { value: 'cork', label: 'Cork', country: 'IRE', type: 'thoroughbred' },
    { value: 'naas', label: 'Naas', country: 'IRE', type: 'thoroughbred' },
    { value: 'tipperary', label: 'Tipperary', country: 'IRE', type: 'thoroughbred' },
    { value: 'gowran-park', label: 'Gowran Park', country: 'IRE', type: 'thoroughbred' },
    { value: 'downpatrick', label: 'Downpatrick', country: 'IRE', type: 'thoroughbred' },

    // ========== UNITED STATES ==========

    { value: 'churchill-downs', label: 'Churchill Downs', country: 'USA', type: 'thoroughbred' },
    { value: 'belmont-park', label: 'Belmont Park', country: 'USA', type: 'thoroughbred' },
    { value: 'saratoga', label: 'Saratoga', country: 'USA', type: 'thoroughbred' },
    { value: 'santa-anita', label: 'Santa Anita Park', country: 'USA', type: 'thoroughbred' },
    { value: 'del-mar', label: 'Del Mar', country: 'USA', type: 'thoroughbred' },
    { value: 'keeneland', label: 'Keeneland', country: 'USA', type: 'thoroughbred' },
    { value: 'gulfstream-park', label: 'Gulfstream Park', country: 'USA', type: 'thoroughbred' },
    { value: 'pimlico', label: 'Pimlico', country: 'USA', type: 'thoroughbred' },
    { value: 'oaklawn-park', label: 'Oaklawn Park', country: 'USA', type: 'thoroughbred' },
    { value: 'fair-grounds', label: 'Fair Grounds', country: 'USA', type: 'thoroughbred' },
    { value: 'monmouth-park', label: 'Monmouth Park', country: 'USA', type: 'thoroughbred' },
    { value: 'aqueduct', label: 'Aqueduct', country: 'USA', type: 'thoroughbred' },
    { value: 'golden-gate-fields', label: 'Golden Gate Fields', country: 'USA', type: 'thoroughbred' },
    { value: 'hollywood-park', label: 'Hollywood Park', country: 'USA', type: 'thoroughbred' },
    { value: 'arlington-park', label: 'Arlington Park', country: 'USA', type: 'thoroughbred' },

    // ========== JAPAN ==========

    { value: 'tokyo-racecourse', label: 'Tokyo Racecourse', country: 'JP', type: 'thoroughbred' },
    { value: 'kyoto-racecourse', label: 'Kyoto Racecourse', country: 'JP', type: 'thoroughbred' },
    { value: 'nakayama', label: 'Nakayama', country: 'JP', type: 'thoroughbred' },
    { value: 'hanshin', label: 'Hanshin', country: 'JP', type: 'thoroughbred' },
    { value: 'chukyo', label: 'Chukyo', country: 'JP', type: 'thoroughbred' },
    { value: 'fukushima', label: 'Fukushima', country: 'JP', type: 'thoroughbred' },
    { value: 'niigata', label: 'Niigata', country: 'JP', type: 'thoroughbred' },
    { value: 'sapporo', label: 'Sapporo', country: 'JP', type: 'thoroughbred' },

    // ========== UAE ==========

    { value: 'meydan', label: 'Meydan', country: 'UAE', type: 'thoroughbred' },
    { value: 'abu-dhabi', label: 'Abu Dhabi', country: 'UAE', type: 'thoroughbred' },

    // ========== FRANCE ==========

    { value: 'longchamp', label: 'Longchamp', country: 'FR', type: 'thoroughbred' },
    { value: 'chantilly', label: 'Chantilly', country: 'FR', type: 'thoroughbred' },
    { value: 'deauville', label: 'Deauville', country: 'FR', type: 'thoroughbred' },
    { value: 'saint-cloud', label: 'Saint-Cloud', country: 'FR', type: 'thoroughbred' },
    { value: 'auteuil', label: 'Auteuil', country: 'FR', type: 'thoroughbred' },
    { value: 'maisons-laffitte', label: 'Maisons-Laffitte', country: 'FR', type: 'thoroughbred' },
    { value: 'lyon-parilly', label: 'Lyon-Parilly', country: 'FR', type: 'thoroughbred' },
] as const;

export type TrackValue = typeof RACE_TRACKS[number]['value'];

/**
 * Get tracks grouped by country
 */
export function getTracksByCountry() {
    const grouped: Record<Country, RaceTrack[]> = {
        AUS: [],
        NZ: [],
        UK: [],
        IRE: [],
        USA: [],
        HK: [],
        SG: [],
        JP: [],
        UAE: [],
        FR: [],
    };
    RACE_TRACKS.forEach((track) => {
        grouped[track.country].push(track);
    });
    return grouped;
}

/**
 * Get tracks grouped by state (for Australian tracks)
 */
export function getTracksByState() {
    const grouped: Record<string, RaceTrack[]> = {};
    RACE_TRACKS.filter(t => t.country === 'AUS').forEach((track) => {
        if (track.state) {
            if (!grouped[track.state]) {
                grouped[track.state] = [];
            }
            grouped[track.state].push(track);
        }
    });
    return grouped;
}

/**
 * Get tracks grouped by racing type
 */
export function getTracksByType() {
    const grouped: Record<RacingType, RaceTrack[]> = {
        thoroughbred: [],
        greyhound: [],
        harness: [],
    };
    RACE_TRACKS.forEach((track) => {
        grouped[track.type].push(track);
    });
    return grouped;
}

/**
 * Get tracks filtered by racing type
 */
export function getTracksByRacingType(type: RacingType | null) {
    if (!type) return RACE_TRACKS;
    return RACE_TRACKS.filter((track) => track.type === type);
}

/**
 * Get track label by value
 */
export function getTrackLabel(value: string | null | undefined): string {
    if (!value) return '';
    const track = RACE_TRACKS.find((t) => t.value === value);
    return track ? track.label : value;
}

/**
 * Get track type by value
 */
export function getTrackType(value: string | null | undefined): RacingType | null {
    if (!value) return null;
    const track = RACE_TRACKS.find((t) => t.value === value);
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

/**
 * Get country display name
 */
export function getCountryLabel(country: Country): string {
    const labels: Record<Country, string> = {
        AUS: 'Australia',
        NZ: 'New Zealand',
        UK: 'United Kingdom',
        IRE: 'Ireland',
        USA: 'United States',
        HK: 'Hong Kong',
        SG: 'Singapore',
        JP: 'Japan',
        UAE: 'United Arab Emirates',
        FR: 'France',
    };
    return labels[country];
}

/**
 * Get country flag emoji
 */
export function getCountryFlag(country: Country): string {
    const flags: Record<Country, string> = {
        AUS: '🇦🇺',
        NZ: '🇳🇿',
        UK: '🇬🇧',
        IRE: '🇮🇪',
        USA: '🇺🇸',
        HK: '🇭🇰',
        SG: '🇸🇬',
        JP: '🇯🇵',
        UAE: '🇦🇪',
        FR: '🇫🇷',
    };
    return flags[country];
}

// Backward compatibility export
export const AUSTRALIAN_RACE_TRACKS = RACE_TRACKS;
