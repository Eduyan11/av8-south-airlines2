import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin, Check, Clock } from 'lucide-react';
import KioskLayout from '@/components/KioskLayout';
import NavButtons from '@/components/NavButtons';
import { useBooking } from '@/context/BookingContext';
import { NOON_DESTINATIONS, ONE_DESTINATIONS, TIME_WINDOWS, TOTAL_SEATS, type Destination } from '@/lib/flights';
import { fetchBookingsForDate } from '@/lib/supabase';

interface SeatCounts {
  [flightCode: string]: number;
}

function FlightCard({
  dest,
  seatsLeft,
  selected,
  onSelect,
}: {
  dest: Destination;
  seatsLeft: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const full = seatsLeft <= 0;
  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all duration-300 ${
        selected
          ? 'border-gold-400 bg-gold-500/10 shadow-xl shadow-gold-500/10 scale-[1.02]'
          : full
          ? 'border-white/5 bg-white/[0.02] opacity-50'
          : 'border-white/10 bg-white/5 hover:border-gold-400/40 hover:bg-white/[0.07]'
      }`}
    >
      {selected && (
        <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4" strokeWidth={3} />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold tracking-widest text-gold-400 uppercase">{dest.flightNumber}</div>
          <div className="font-display text-2xl font-bold mt-1">
            {dest.city} <span className="text-white/40 text-lg font-medium">{dest.code}</span>
          </div>
          <div className="text-sm text-white/45">{dest.country}</div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-sm text-white/60 justify-end">
            <Clock className="w-3.5 h-3.5" />
            {dest.timeWindow}
          </div>
          <div className="text-xs text-white/35 mt-1">Nonstop · {dest.duration}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="text-sm text-white/60">
          <span className="text-gold-300 font-semibold">PHX</span>
          <span className="mx-2">→</span>
          <span className="text-gold-300 font-semibold">{dest.code}</span>
          <span className="ml-3 inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {full ? 'Full' : `${seatsLeft} seats left`}
          </span>
        </div>
        <button
          onClick={onSelect}
          disabled={full}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            selected
              ? 'bg-gold-500 text-navy-950'
              : full
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-white/10 text-gold-300 hover:bg-gold-500 hover:text-navy-950'
          }`}
        >
          {selected ? 'Selected' : full ? 'Sold Out' : 'Select Flight'}
        </button>
      </div>
    </div>
  );
}

export default function FlightPage() {
  const navigate = useNavigate();
  const { date, flightCode, setFlightCode } = useBooking();
  const [counts, setCounts] = useState<SeatCounts>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    let alive = true;
    fetchBookingsForDate(date)
      .then((bookings) => {
        if (!alive) return;
        const taken: SeatCounts = {};
        for (const b of bookings) taken[b.flight_code] = (taken[b.flight_code] ?? 0) + 1;
        setCounts(taken);
      })
      .catch(() => alive && setError('Could not load seat availability. Please try again.'));
    return () => {
      alive = false;
    };
  }, [date]);

  const selectedDest = useMemo(
    () => [...NOON_DESTINATIONS, ...ONE_DESTINATIONS].find((d) => d.flightNumber === flightCode) ?? null,
    [flightCode]
  );

  if (!date) {
    return (
      <KioskLayout>
        <div className="text-center py-20">
          <p className="text-white/60 mb-6">Please choose a date first.</p>
          <button onClick={() => navigate('/book/date')} className="px-6 py-3 rounded-xl bg-gold-500 text-navy-950 font-bold">
            Choose a Date
          </button>
        </div>
      </KioskLayout>
    );
  }

  const seatsLeftFor = (d: Destination) => TOTAL_SEATS - (counts[d.flightNumber] ?? 0);

  const renderGroup = (key: 'noon' | 'one', list: Destination[]) => {
    const w = TIME_WINDOWS.find((t) => t.key === key)!;
    return (
      <section className="mt-8 first:mt-0">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 font-semibold text-sm">
            <Clock className="w-4 h-4" />
            {w.label}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {list.map((d) => (
            <FlightCard
              key={d.flightNumber}
              dest={d}
              seatsLeft={seatsLeftFor(d)}
              selected={flightCode === d.flightNumber}
              onSelect={() => setFlightCode(d.flightNumber)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <KioskLayout step={2} maxWidth="max-w-6xl">
      <h2 className="font-display text-3xl font-bold">Choose your flight</h2>
      <p className="text-white/50 mt-2">
        All flights depart from Phoenix (<span className="text-gold-300 font-semibold">PHX</span>) on{' '}
        <span className="text-white/80 font-medium">{date}</span>. Departure times are fixed per destination.
      </p>
      {error && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm">{error}</div>
      )}

      {renderGroup('noon', NOON_DESTINATIONS)}
      {renderGroup('one', ONE_DESTINATIONS)}

      {selectedDest && (
        <div className="mt-8 rounded-2xl border border-gold-500/40 bg-gold-500/10 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold-300 font-semibold">Selected flight</div>
            <div className="font-display text-xl font-bold mt-0.5">
              {selectedDest.flightNumber} · {selectedDest.city} ({selectedDest.code})
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-gold-300 font-semibold">Departs</div>
            <div className="font-semibold mt-0.5">{selectedDest.timeWindow}</div>
          </div>
        </div>
      )}

      <NavButtons
        onBack={() => navigate('/book/date')}
        onNext={() => navigate('/book/passenger')}
        nextDisabled={!flightCode}
      />
    </KioskLayout>
  );
}
