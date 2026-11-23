import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Plane, CalendarDays, Clock, Armchair, RotateCcw, ArrowRight, Fingerprint } from 'lucide-react';
import KioskLayout from '@/components/KioskLayout';
import type { Booking } from '@/lib/supabase';

export default function BoardingPassPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(
    (location.state as { booking?: Booking } | null)?.booking ?? null
  );

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const initials = `${booking.first_name[0] ?? ''}${booking.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <KioskLayout showStep={false}>
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold">You're all set!</h2>
        <p className="text-white/50 mt-2">Show this boarding pass at the gate to board your flight.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl overflow-hidden border border-gold-500/30 shadow-2xl shadow-gold-500/10 bg-gradient-to-br from-navy-900 to-navy-800">
          <div className="bg-gradient-to-r from-gold-500 to-gold-400 px-6 md:px-8 py-4 flex items-center justify-between text-navy-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-950 flex items-center justify-center">
                <Plane className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="font-display font-bold leading-tight">AV8 SOUTH Airlines</div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-semibold opacity-70">Beyond Every Horizon</div>
              </div>
            </div>
            <div className="font-display font-bold text-sm tracking-wider">BOARDING PASS</div>
          </div>

          <div className="px-6 md:px-8 py-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="text-xs uppercase tracking-widest text-white/40 font-semibold">Passenger</div>
                <div className="font-display text-2xl font-bold mt-1 break-words">
                  {booking.first_name} {booking.last_name ?? ''}
                </div>
                <div className="mt-1 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-xs text-gold-300 font-semibold tracking-wider">
                  <Fingerprint className="w-3.5 h-3.5" />
                  {booking.booking_ref}
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-display font-bold text-xl text-gold-300 shrink-0">
                {initials || 'AV'}
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="font-display text-4xl font-bold">PHX</div>
                <div className="text-sm text-white/50">Phoenix</div>
              </div>
              <div className="flex-1 mx-4 mb-4 relative">
                <div className="h-px bg-gradient-to-r from-gold-500/60 via-white/30 to-gold-500/60" />
                <Plane className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 text-gold-400 rotate-90 bg-navy-900" />
              </div>
              <div className="text-right">
                <div className="font-display text-4xl font-bold text-gold-400">{booking.airport_code}</div>
                <div className="text-sm text-white/50">{booking.destination}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/40 font-semibold">
                  <CalendarDays className="w-3.5 h-3.5" /> Date
                </div>
                <div className="mt-1 font-semibold">{booking.flight_date}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/40 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Departure
                </div>
                <div className="mt-1 font-semibold">{booking.time_window}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/40 font-semibold">
                  <Armchair className="w-3.5 h-3.5" /> Seat
                </div>
                <div className="mt-1 font-display font-bold text-xl text-gold-400">{booking.seat}</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-white/30">Flight {booking.flight_code} · Nonstop · Fictional school event flight</div>
          </div>

          <div className="border-t-2 border-dashed border-white/15" />

          <div className="px-6 md:px-8 py-6 flex flex-col items-center bg-navy-900/60">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <QRCodeCanvas
                value={booking.token}
                size={148}
                level="M"
                includeMargin={false}
                fgColor="#0a1628"
              />
            </div>
            <div className="mt-3 text-xs tracking-[0.3em] uppercase text-white/40">Scan at gate</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gold-500 text-navy-950 font-bold hover:bg-gold-400 transition-all active:scale-95 shadow-lg shadow-gold-500/25"
          >
            <RotateCcw className="w-5 h-5" />
            Book Another Flight
          </button>
          <button
            onClick={() => navigate('/staff')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 font-semibold transition-all"
          >
            Staff Portal <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </KioskLayout>
  );
}
