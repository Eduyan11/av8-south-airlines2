import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import KioskLayout from '@/components/KioskLayout';
import NavButtons from '@/components/NavButtons';
import { useBooking } from '@/context/BookingContext';
import { DESTINATIONS, SEAT_ROWS, SEAT_LETTERS, TOTAL_SEATS, seatId } from '@/lib/flights';
import { fetchBookingsForDate } from '@/lib/supabase';

export default function SeatPage() {
  const navigate = useNavigate();
  const { date, flightCode, seat, setSeat } = useBooking();
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !flightCode) return;
    let alive = true;
    fetchBookingsForDate(date)
      .then((bookings) => {
        if (!alive) return;
        const takenSeats = new Set(
          bookings.filter((b) => b.flight_code === flightCode).map((b) => b.seat)
        );
        setTaken(takenSeats);
      })
      .catch(() => alive && setError('Could not load the seat map. Please go back and try again.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [date, flightCode]);

  if (!date || !flightCode) {
    return (
      <KioskLayout>
        <div className="text-center py-20">
          <p className="text-white/60 mb-6">Please choose a flight first.</p>
          <button onClick={() => navigate('/book/flights')} className="px-6 py-3 rounded-xl bg-gold-500 text-navy-950 font-bold">
            Choose a Flight
          </button>
        </div>
      </KioskLayout>
    );
  }

  const dest = DESTINATIONS.find((d) => d.flightNumber === flightCode)!;
  const seatsLeft = TOTAL_SEATS - taken.size;

  const pick = (s: string) => {
    if (taken.has(s)) return;
    setSeat(s);
  };

  return (
    <KioskLayout step={4} maxWidth="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Choose your seat</h2>
          <p className="text-white/50 mt-2">
            {dest.flightNumber} · PHX → {dest.code} · {date}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-display font-bold text-gold-400">{seatsLeft}</div>
          <div className="text-sm text-white/50">seats available</div>
        </div>
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm">{error}</div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8">
          <div className="mx-auto max-w-md">
            <div className="text-center mb-5">
              <div className="mx-auto w-40 h-1.5 rounded-full bg-white/15" />
              <div className="mt-2 text-xs tracking-[0.3em] uppercase text-white/40">Front of aircraft</div>
            </div>
            {loading ? (
              <div className="py-20 text-center text-white/40">Loading seat map…</div>
            ) : (
              <div className="space-y-2.5">
                {Array.from({ length: SEAT_ROWS }, (_, ri) => ri + 1).map((row) => (
                  <div key={row} className="flex items-center justify-center gap-2.5">
                    {SEAT_LETTERS.map((letter, li) => {
                      const s = seatId(row, letter);
                      const isTaken = taken.has(s);
                      const isMine = seat === s;
                      const aisle = li === 3 ? 'ml-8' : '';
                      return (
                        <button
                          key={s}
                          onClick={() => pick(s)}
                          disabled={isTaken}
                          aria-label={`Seat ${s}`}
                          className={`w-11 h-11 rounded-t-xl rounded-b-md text-sm font-semibold transition-all active:scale-90 ${aisle} ${
                            isMine
                              ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/40 scale-110 ring-2 ring-gold-300'
                              : isTaken
                              ? 'bg-white/[0.06] text-white/20 cursor-not-allowed'
                              : 'bg-white/15 text-white/70 hover:bg-gold-500/40 hover:text-white'
                          }`}
                        >
                          {isTaken ? '' : letter}
                        </button>
                      );
                    })}
                    <span className="ml-8 w-8 text-white/30 text-sm font-medium">{row}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="self-start">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <div className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">Legend</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-white/15" /> Available
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-gold-500" /> Your seat
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-white/[0.06]" /> Already reserved
              </div>
            </div>
          </div>

          {seat && (
            <div className="mt-4 rounded-2xl border border-gold-500/40 bg-gold-500/10 p-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-gold-300 font-semibold">Selected seat</div>
                <div className="font-display text-3xl font-bold mt-0.5">{seat}</div>
              </div>
              <Check className="w-8 h-8 text-gold-400" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      <NavButtons onBack={() => navigate('/book/passenger')} onNext={() => navigate('/book/confirm')} nextDisabled={!seat} />
    </KioskLayout>
  );
}
