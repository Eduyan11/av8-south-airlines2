import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import KioskLayout from '@/components/KioskLayout';
import NavButtons from '@/components/NavButtons';
import { useBooking } from '@/context/BookingContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function DatePage() {
  const navigate = useNavigate();
  const { date, setDate } = useBooking();
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => {
    if (date) {
      const [y, m] = date.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const minView = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxView = new Date(today.getFullYear(), today.getMonth() + 3, 1);

  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const canGoPrev = view > minView;
  const canGoNext = view < maxView;

  const pick = (day: number) => {
    const d = new Date(year, month, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    setDate(toISO(d));
  };

  return (
    <KioskLayout step={1}>
      <h2 className="font-display text-3xl font-bold">Select your event date</h2>
      <p className="text-white/50 mt-2">Choose an available date for your fictional flight.</p>

      <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => canGoPrev && setView(new Date(year, month - 1, 1))}
            disabled={!canGoPrev}
            className="p-3 rounded-xl hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="font-display text-2xl font-bold tracking-wide">
            {MONTHS[month]} <span className="text-gold-400">{year}</span>
          </div>
          <button
            onClick={() => canGoNext && setView(new Date(year, month + 1, 1))}
            disabled={!canGoNext}
            className="p-3 rounded-xl hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Next month"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm text-white/40 font-semibold mb-2">
          {DOW.map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const d = new Date(year, month, day);
            const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const iso = toISO(d);
            const selected = date === iso;
            return (
              <button
                key={iso}
                onClick={() => pick(day)}
                disabled={isPast}
                className={`aspect-square rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                  selected
                    ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/30 scale-105'
                    : isPast
                    ? 'text-white/15 cursor-not-allowed'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <NavButtons onBack={() => navigate('/')} onNext={() => date && navigate('/book/flights')} nextDisabled={!date} />
    </KioskLayout>
  );
}
