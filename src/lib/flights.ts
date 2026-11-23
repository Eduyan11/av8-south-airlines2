export interface Destination {
  code: string;
  city: string;
  country: string;
  flightNumber: string;
  timeWindow: string;
  windowKey: 'noon' | 'one';
  duration: string;
}

export interface TimeWindow {
  key: 'noon' | 'one';
  label: string;
  endTime: string;
}

export const TIME_WINDOWS: TimeWindow[] = [
  { key: 'noon', label: '12:00 PM – 12:45 PM', endTime: '12:45 PM' },
  { key: 'one', label: '1:00 PM – 1:30 PM', endTime: '1:30 PM' },
];

export const DESTINATIONS: Destination[] = [
  { code: 'MNL', city: 'Manila', country: 'Philippines', flightNumber: 'AV801', timeWindow: '12:00 PM – 12:45 PM', windowKey: 'noon', duration: '11h 35m' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', flightNumber: 'AV802', timeWindow: '12:00 PM – 12:45 PM', windowKey: 'noon', duration: '12h 10m' },
  { code: 'LHR', city: 'London', country: 'United Kingdom', flightNumber: 'AV803', timeWindow: '12:00 PM – 12:45 PM', windowKey: 'noon', duration: '10h 55m' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', flightNumber: 'AV804', timeWindow: '1:00 PM – 1:30 PM', windowKey: 'one', duration: '18h 05m' },
  { code: 'TIJ', city: 'Tijuana', country: 'Mexico', flightNumber: 'AV805', timeWindow: '1:00 PM – 1:30 PM', windowKey: 'one', duration: '1h 15m' },
];

export const NOON_DESTINATIONS = DESTINATIONS.filter((d) => d.windowKey === 'noon');
export const ONE_DESTINATIONS = DESTINATIONS.filter((d) => d.windowKey === 'one');

export const SEAT_ROWS = 8;
export const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const TOTAL_SEATS = SEAT_ROWS * SEAT_LETTERS.length;

export function seatId(row: number, letter: string): string {
  return `${row}${letter}`;
}

export function allSeatIds(): string[] {
  const seats: string[] = [];
  for (let r = 1; r <= SEAT_ROWS; r++) {
    for (const l of SEAT_LETTERS) seats.push(seatId(r, l));
  }
  return seats;
}
