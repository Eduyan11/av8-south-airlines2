import { Plane, Globe2 } from 'lucide-react';
import { type ReactNode } from 'react';

interface KioskLayoutProps {
  children: ReactNode;
  step?: number;
  showStep?: boolean;
  maxWidth?: string;
}

const STEPS = ['Date', 'Flight', 'Details', 'Seat'];

export default function KioskLayout({ children, step, showStep = true, maxWidth = 'max-w-5xl' }: KioskLayoutProps) {
  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-navy-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Plane className="w-6 h-6 text-navy-950" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-tight tracking-wide">
              AV8 SOUTH <span className="text-gold-400">Airlines</span>
            </div>
            <div className="text-xs text-white/50 tracking-[0.25em] uppercase">Beyond Every Horizon</div>
          </div>
        </div>
        {showStep && typeof step === 'number' && (
          <nav className="hidden md:flex items-center gap-1">
            {STEPS.map((label, i) => {
              const idx = i + 1;
              const active = idx === step;
              const done = idx < step;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    active
                      ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/30'
                      : done
                      ? 'text-gold-400'
                      : 'text-white/40'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold ${
                      active ? 'bg-navy-950 text-gold-400' : done ? 'bg-gold-500/20' : 'bg-white/10'
                    }`}
                  >
                    {idx}
                  </span>
                  {label}
                </div>
              );
            })}
          </nav>
        )}
      </header>
      <main className={`flex-1 w-full ${maxWidth} mx-auto px-6 py-8`}>{children}</main>
      <footer className="px-8 py-4 text-center text-xs text-white/30 tracking-wide">
        AV8 SOUTH Aviation Program · Fictional flights for a school event
      </footer>
    </div>
  );
}

export function FlightBadge({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wider text-gold-300">
      <Globe2 className="w-3.5 h-3.5" />
      {code}
    </span>
  );
}
