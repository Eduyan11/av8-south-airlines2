import { createContext, useContext, useState, type ReactNode } from 'react';

export interface BookingDraft {
  date: string | null;
  flightCode: string | null;
  firstName: string;
  lastName: string;
  seat: string | null;
}

interface BookingContextValue extends BookingDraft {
  setDate: (d: string) => void;
  setFlightCode: (c: string) => void;
  setFirstName: (n: string) => void;
  setLastName: (n: string) => void;
  setSeat: (s: string) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const initial: BookingDraft = {
  date: null,
  flightCode: null,
  firstName: '',
  lastName: '',
  seat: null,
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(initial);

  const value: BookingContextValue = {
    ...draft,
    setDate: (d) => setDraft((prev) => ({ ...prev, date: d })),
    setFlightCode: (c) => setDraft((prev) => ({ ...prev, flightCode: c })),
    setFirstName: (n) => setDraft((prev) => ({ ...prev, firstName: n })),
    setLastName: (n) => setDraft((prev) => ({ ...prev, lastName: n })),
    setSeat: (s) => setDraft((prev) => ({ ...prev, seat: s })),
    reset: () => setDraft(initial),
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
