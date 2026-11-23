import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plane, ArrowRight } from 'lucide-react';
import KioskLayout from '@/components/KioskLayout';
import NavButtons from '@/components/NavButtons';
import { useBooking } from '@/context/BookingContext';
import { DESTINATIONS } from '@/lib/flights';

export default function PassengerPage() {
  const navigate = useNavigate();
  const { flightCode, firstName, lastName, setFirstName, setLastName } = useBooking();
  const [touched, setTouched] = useState(false);

  const dest = DESTINATIONS.find((d) => d.flightNumber === flightCode);

  if (!dest) {
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

  const valid = firstName.trim().length >= 1;
  const showNameError = touched && !valid;

  return (
    <KioskLayout step={3}>
      <h2 className="font-display text-3xl font-bold">Passenger details</h2>
      <p className="text-white/50 mt-2">We only need a name for this school event — no ID, no payment.</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8">
          <label className="block text-sm font-semibold text-white/70 mb-2">
            First name <span className="text-gold-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Alex"
              autoFocus
              className={`w-full pl-12 pr-4 py-4 rounded-xl bg-navy-900/60 border text-lg text-white placeholder-white/25 outline-none transition-colors ${
                showNameError ? 'border-red-500/60' : 'border-white/15 focus:border-gold-400'
              }`}
            />
          </div>
          {showNameError && <p className="mt-2 text-sm text-red-300">Please enter your first name.</p>}

          <label className="block text-sm font-semibold text-white/70 mb-2 mt-6">
            Last name <span className="text-white/35 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Optional"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-navy-900/60 border border-white/15 focus:border-gold-400 text-lg text-white placeholder-white/25 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-gold-500/15 to-transparent border border-gold-500/30 p-6 md:p-8 self-start">
          <div className="flex items-center gap-2 text-gold-300 text-xs font-semibold uppercase tracking-widest">
            <Plane className="w-4 h-4" />
            Your flight
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-white/50 text-sm">Flight</span>
              <span className="font-display font-bold text-lg">{dest.flightNumber}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-white/50 text-sm">Route</span>
              <span className="font-semibold">PHX → {dest.code}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-white/50 text-sm">Destination</span>
              <span className="font-semibold">{dest.city}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-white/50 text-sm">Departure</span>
              <span className="font-semibold">{dest.timeWindow}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/book/flights')}
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-gold-300 hover:text-gold-200 transition-colors"
          >
            Change flight <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <NavButtons
        onBack={() => navigate('/book/flights')}
        onNext={() => navigate('/book/seats')}
        nextDisabled={!valid}
      />
    </KioskLayout>
  );
}
