import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, CalendarDays, Clock, Armchair, AlertTriangle } from 'lucide-react';
import KioskLayout from '@/components/KioskLayout';
import NavButtons from '@/components/NavButtons';
import { useBooking } from '@/context/BookingContext';
import { DESTINATIONS, TOTAL_SEATS } from '@/lib/flights';
import { createBooking, fetchBookingsForDate, type Booking } from '@/lib/supabase';
import { bookingRef, randomToken } from '@/lib/generate';

export default function ConfirmPage() {
  const navigate = useNavigate();
  const { date, flightCode, firstName, lastName, seat, reset } = useBooking();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const dest = DESTINATIONS.find((d) => d.flightNumber === flightCode);

  if (!date || !dest || !seat || !firstName.trim()) {
    return (
      <KioskLayout>
        <div className="text-center py-20">
          <p className="text-white/60 mb-6">Your booking is incomplete. Let's start over.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl bg-gold-500 text-navy-950 font-bold">
            Back to Start
          </button>
        </div>
      </KioskLayout>
    );
  }

  const fullName = lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim();

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const bookings = await fetchBookingsForDate(date);
      const sameFlight = bookings.filter((b) => b.flight_code === dest.flightNumber);
      if (sameFlight.some((b) => b.seat === seat)) {
        setError(`Seat ${seat} was just taken. Please pick another seat.`);
        setBusy(false);
        return;
      }
      if (sameFlight.length >= TOTAL_SEATS) {
        setError('This flight just sold out. Please pick another flight.');
        setBusy(false);
        return;
      }
      const row: Omit<Booking, 'id' | 'created_at' | 'status'> = {
        booking_ref: bookingRef(),
        token: randomToken(),
        flight_code: dest.flightNumber,
        destination: dest.city,
        airport_code: dest.code,
        flight_date: date,
        time_window: dest.timeWindow,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        seat,
      };
      const saved = await createBooking(row);
      reset();
      navigate('/boarding-pass', { state: { booking: saved } });
    } catch {
      setError('We could not save your booking. Please try again.');
      setBusy(false);
    }
  };

  return (
    <KioskLayout>
      <h2 className="font-display text-3xl font-bold">Review your booking</h2>
      <p className="text-white/50 mt-2">Check everything looks right, then confirm to receive your boarding pass.</p>

      <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="bg-gradient-to-r from-gold-500/20 to-transparent px-6 md:px-8 py-5 flex items-center gap-3">
          <Plane className="w-5 h-5 text-gold-400" />
          <span className="font-display font-bold text-lg">
            {dest.flightNumber} · Phoenix (PHX) → {dest.city} ({dest.code})
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-white/10 sm:divide-x">
          {[
            { icon: CalendarDays, label: 'Date', value: date },
            { icon: Clock, label: 'Departure', value: dest.timeWindow },
            { icon: Armchair, label: 'Seat', value: seat },
            { icon: undefined, label: 'Passenger', value: fullName },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="px-6 md:px-8 py-5">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/40 font-semibold">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </div>
              <div className="mt-1.5 font-semibold text-lg">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <NavButtons
        onBack={() => navigate('/book/seats')}
        onNext={confirm}
        nextLabel="Confirm Booking"
        busy={busy}
      />
    </KioskLayout>
  );
}
