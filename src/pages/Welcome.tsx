import { useNavigate } from 'react-router-dom';
import { Plane, ArrowRight, ShieldCheck, QrCode, Clock } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full bg-sky-500/10 blur-3xl" />

      <header className="relative flex items-center justify-center gap-4 pt-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/25">
          <Plane className="w-9 h-9 text-navy-950" strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="font-display font-bold text-4xl tracking-wide">
            AV8 SOUTH <span className="text-gold-400">Airlines</span>
          </h1>
          <p className="text-sm text-white/50 tracking-[0.35em] uppercase mt-1">Beyond Every Horizon</p>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.25em] uppercase text-gold-300 mb-8">
          <Clock className="w-3.5 h-3.5" />
          Self-Service Check-In Kiosk
        </div>
        <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight max-w-3xl">
          Welcome aboard.<br />
          <span className="text-gold-400">Your journey starts here.</span>
        </h2>
        <p className="mt-6 text-lg text-white/60 max-w-xl leading-relaxed">
          Book a fictional flight with AV8 SOUTH Airlines, choose your seat, and receive your digital
          boarding pass in under a minute.
        </p>
        <button
          onClick={() => navigate('/book/date')}
          className="group mt-12 flex items-center gap-4 px-12 py-6 rounded-2xl bg-gold-500 text-navy-950 font-bold text-2xl hover:bg-gold-400 transition-all active:scale-95 shadow-2xl shadow-gold-500/30 hover:shadow-gold-400/40"
        >
          Book a Flight
          <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-1.5" />
        </button>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {[
            { icon: Clock, title: '2 Windows', text: '12:00 PM & 1:00 PM departures' },
            { icon: QrCode, title: 'QR Boarding Pass', text: 'Scan and board in seconds' },
            { icon: ShieldCheck, title: 'AV8 SOUTH', text: 'School aviation program' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white/5 border border-white/10 p-5 text-left hover:bg-white/10 transition-colors">
              <Icon className="w-6 h-6 text-gold-400 mb-3" />
              <div className="font-semibold">{title}</div>
              <div className="text-sm text-white/50 mt-1">{text}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative pb-6 text-center text-xs text-white/30 tracking-wide">
        All flights are fictional and part of the AV8 SOUTH school aviation event.
      </footer>
    </div>
  );
}
