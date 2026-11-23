import { useRef, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children?: ReactNode;
  busy?: boolean;
}

export default function NavButtons({ onBack, onNext, nextLabel = 'Continue', nextDisabled, children, busy }: NavButtonsProps) {
  const timer = useRef<number | null>(null);
  return (
    <div className="flex items-center justify-between mt-8">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        {children}
        {onNext && (
          <button
            onClick={() => {
              if (busy || timer.current) return;
              timer.current = window.setTimeout(() => (timer.current = null), 600);
              onNext();
            }}
            disabled={nextDisabled || busy}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gold-500 text-navy-950 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-gold-500/25"
          >
            {busy ? 'Saving…' : nextLabel}
            {!busy && <ArrowRight className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
