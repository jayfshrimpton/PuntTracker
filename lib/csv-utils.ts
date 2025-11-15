import { Bet, BetInput } from './api';

/**
 * Converts an array of bets to CSV format
 */
export function exportBetsToCSV(bets: Bet[]): string {
  if (bets.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'Date',
    'Venue',
    'Race Number',
    'Race Name',
    'Class',
    'Horse Name',
    'Bet Type',
    'Price/Odds',
    'Stake',
    'Finishing Position',
    'Profit/Loss',
    'Exotic Numbers',
    'Number of Legs',
    'Description',
    'Strategy/Tags',
    'Notes',
  ];

  // Create CSV rows
  const rows = bets.map((bet) => {
    return [
      bet.bet_date,
      bet.venue || '',
      bet.race_number?.toString() || '',
      escapeCSVField(bet.race_name || ''),
      escapeCSVField(bet.race_class || ''),
      escapeCSVField(bet.horse_name || ''),
      bet.bet_type,
      bet.price.toString(),
      bet.stake.toString(),
      bet.finishing_position?.toString() || '',
      bet.profit_loss?.toString() || '',
      bet.exotic_numbers || '',
      bet.num_legs?.toString() || '',
      escapeCSVField(bet.description || ''),
      bet.strategy_tags?.join(', ') || '',
      escapeCSVField(bet.notes || ''),
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) => row.join(','))
    .join('\n');

  return csvContent;
}

/**
 * Escapes CSV fields that contain commas, quotes, or newlines
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses CSV content and converts it to BetInput array
 */
export function parseCSVToBets(csvContent: string): {
  bets: BetInput[];
  errors: string[];
} {
  const bets: BetInput[] = [];
  const errors: string[] = [];

  // Split into lines
  const lines = csvContent.split('\n').filter((line) => line.trim() !== '');

  if (lines.length < 2) {
    errors.push('CSV file must contain at least a header row and one data row');
    return { bets, errors };
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  const headerMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    headerMap[header.toLowerCase().trim()] = index;
  });

  // Validate required headers
  const requiredHeaders = ['date', 'race name', 'horse name', 'bet type', 'price/odds', 'stake'];
  const missingHeaders = requiredHeaders.filter(
    (header) => !headerMap[header.toLowerCase()]
  );

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    return { bets, errors };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);

      // Extract values using header map
      const getValue = (headerName: string): string => {
        const index = headerMap[headerName.toLowerCase()];
        return index !== undefined ? (values[index] || '').trim() : '';
      };

      const betDate = getValue('date');
      const venue = getValue('venue');
      const raceNumberStr = getValue('race number');
      const raceName = getValue('race name');
      const raceClass = getValue('class');
      const horseName = getValue('horse name');
      const betType = getValue('bet type');
      const priceStr = getValue('price/odds');
      const stakeStr = getValue('stake');
      const finishingPositionStr = getValue('finishing position');
      const profitLossStr = getValue('profit/loss');
      const exoticNumbers = getValue('exotic numbers');
      const numLegsStr = getValue('number of legs');
      const description = getValue('description');
      const strategyTagsStr = getValue('strategy/tags');
      const notes = getValue('notes');

      // Validate required fields
      if (!betDate || !horseName || !betType || !priceStr || !stakeStr) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      // Validate and convert bet type
      const validBetTypes = [
        'win',
        'place',
        'lay',
        'each-way',
        'multi',
        'quinella',
        'exacta',
        'trifecta',
        'first-four',
        'other',
      ];
      const normalizedBetType = betType.toLowerCase().trim();
      if (!validBetTypes.includes(normalizedBetType)) {
        errors.push(
          `Row ${i + 1}: Invalid bet type "${betType}". Must be one of: ${validBetTypes.join(', ')}`
        );
        continue;
      }

      // Convert numeric values
      const price = parseFloat(priceStr);
      const stake = parseFloat(stakeStr);

      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${i + 1}: Invalid price/odds value "${priceStr}"`);
        continue;
      }

      if (isNaN(stake) || stake <= 0) {
        errors.push(`Row ${i + 1}: Invalid stake value "${stakeStr}"`);
        continue;
      }

      // Parse optional fields
      const finishingPosition = finishingPositionStr
        ? parseInt(finishingPositionStr, 10)
        : null;
      const profitLoss = profitLossStr ? parseFloat(profitLossStr) : null;
      const numLegs = numLegsStr ? parseInt(numLegsStr, 10) : null;

      // Validate finishing position
      if (finishingPosition !== null && (isNaN(finishingPosition) || finishingPosition < 1)) {
        errors.push(`Row ${i + 1}: Invalid finishing position "${finishingPositionStr}"`);
        continue;
      }

      // Parse strategy tags
      const strategyTags = strategyTagsStr
        ? strategyTagsStr
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : null;

      // Parse race number
      const raceNumber = raceNumberStr ? parseInt(raceNumberStr, 10) : null;
      if (raceNumber !== null && (isNaN(raceNumber) || raceNumber < 1 || raceNumber > 12)) {
        errors.push(`Row ${i + 1}: Invalid race number "${raceNumberStr}"`);
        continue;
      }

      // Create bet input
      const bet: BetInput = {
        bet_date: betDate,
        race_name: raceName || null,
        horse_name: horseName,
        bet_type: normalizedBetType as BetInput['bet_type'],
        price,
        stake,
        finishing_position: finishingPosition || null,
        profit_loss: profitLoss || null,
        exotic_numbers: exoticNumbers || null,
        num_legs: numLegs || null,
        description: description || null,
        strategy_tags: strategyTags && strategyTags.length > 0 ? strategyTags : null,
        notes: notes || null,
        venue: venue || null,
        race_number: raceNumber,
        race_class: raceClass || null,
        selections: null,
      };

      bets.push(bet);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { bets, errors };
}

/**
 * Parses a CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(current);

  return values;
}

