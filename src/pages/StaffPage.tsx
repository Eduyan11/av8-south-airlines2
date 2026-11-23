import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, LayoutDashboard, LogOut, ScanLine, Users, CheckCircle2, Clock3, Flag, RefreshCw, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { fetchBookingsForDate, updateBookingStatus, findBookingByToken, type Booking } from '@/lib/supabase';
import { randomToken } from '@/lib/generate';

const STAFF_PIN = '1234';
const SCANNER_ELEMENT_ID = 'qr-scanner-region';

type ScanResult =
  | { kind: 'idle' }
  | { kind: 'valid'; booking: Booking }
  | { kind: 'invalid'; reason: string };

function formatDate(d: string): string {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function StaffPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('av8-staff') === 'yes');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [tab, setTab] = useState<'scan' | 'dashboard'>('scan');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState<ScanResult>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const today = new Date();
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const rows = await fetchBookingsForDate(iso);
      setBookings(rows);
    } catch {
      setScanError('Could not load bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (authed) loadBookings();
  }, [authed]);

  useEffect(() => {
    return () => {
      const el = document.getElementById(SCANNER_ELEMENT_ID);
      if (el && el.firstChild) {
        const instance = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
        instance.stop().catch(() => undefined);
      }
    };
  }, []);

  const stats = useMemo(
    () => ({
      registered: bookings.filter((b) => b.status === 'registered').length,
      checkedIn: bookings.filter((b) => b.status === 'checked_in').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
    }),
    [bookings]
  );

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === STAFF_PIN) {
      sessionStorage.setItem('av8-staff', 'yes');
      setAuthed(true);
      setPinError(null);
    } else {
      setPinError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const startScanner = async () => {
    setScanError(null);
    setResult({ kind: 'idle' });
    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          scanner.stop().catch(() => undefined);
          setScanning(false);
          handleToken(decoded);
        },
        () => undefined
      );
      setScanning(true);
    } catch {
      setScanError('Camera unavailable. Use manual entry below.');
    }
  };

  const handleToken = async (raw: string) => {
    setBusy(true);
    setResult({ kind: 'idle' });
    const token = raw.trim();
    try {
      const b = await findBookingByToken(token);
      if (!b) {
        setResult({ kind: 'invalid', reason: 'This QR code does not match any booking.' });
        return;
      }
      if (b.status === 'checked_in') {
        setResult({ kind: 'invalid', reason: `${b.first_name}'s pass was already checked in. Each pass can only be used once.` });
        return;
      }
      if (b.status === 'completed') {
        setResult({ kind: 'invalid', reason: 'This flight has already been completed.' });
        return;
      }
      await updateBookingStatus(b.id, 'checked_in');
      setResult({ kind: 'valid', booking: { ...b, status: 'checked_in' } });
      loadBookings();
    } catch {
      setResult({ kind: 'invalid', reason: 'Verification failed. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const markCompleted = async (b: Booking) => {
    setBusy(true);
    try {
      await updateBookingStatus(b.id, 'completed');
      setResult({ kind: 'idle' });
      loadBookings();
    } catch {
      setScanError('Could not update status.');
    } finally {
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center px-6">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl bg-white/5 border border-white/10 p-8">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-center mt-4">Staff Portal</h1>
          <p className="text-white/50 text-sm text-center mt-1">AV8 SOUTH Airlines · Check-In Operations</p>
          <label className="block text-sm font-semibold text-white/70 mt-8 mb-2">Staff PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            autoFocus
            className={`w-full px-4 py-4 rounded-xl bg-navy-900/60 border text-center text-2xl tracking-[0.5em] font-semibold outline-none transition-colors ${
              pinError ? 'border-red-500/60' : 'border-white/15 focus:border-gold-400'
            }`}
          />
          {pinError && <p className="mt-2 text-sm text-red-300 text-center">{pinError}</p>}
          <button
            type="submit"
            className="w-full mt-6 py-3.5 rounded-xl bg-gold-500 text-navy-950 font-bold hover:bg-gold-400 transition-all active:scale-95"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full mt-3 py-2.5 text-sm text-white/40 hover:text-white transition-colors"
          >
            Back to Kiosk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <header className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10 bg-navy-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <div className="font-display font-bold">AV8 SOUTH · Staff Portal</div>
            <div className="text-xs text-white/40">Check-In Operations</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('scan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'scan' ? 'bg-gold-500 text-navy-950' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <QrCode className="w-4 h-4" /> Scan
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'dashboard' ? 'bg-gold-500 text-navy-950' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('av8-staff');
              setAuthed(false);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === 'scan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <h2 className="font-display text-xl font-bold">Scan boarding pass</h2>
              <p className="text-white/50 text-sm mt-1">Point the camera at the passenger's QR code.</p>
              <div
                id={SCANNER_ELEMENT_ID}
                className="mt-4 rounded-2xl overflow-hidden bg-navy-900/80 min-h-[260px] flex items-center justify-center border border-white/10"
              >
                {!scanning && (
                  <div className="text-center py-10 px-6">
                    <QrCode className="w-12 h-12 text-white/20 mx-auto" />
                    <p className="text-white/40 text-sm mt-3">Camera is off</p>
                  </div>
                )}
              </div>
              {!scanning ? (
                <button
                  onClick={startScanner}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold-500 text-navy-950 font-bold hover:bg-gold-400 transition-all active:scale-95"
                >
                  <ScanLine className="w-5 h-5" /> Start Camera Scanner
                </button>
              ) : (
                <p className="mt-4 text-center text-sm text-gold-300 animate-pulse">Scanning… hold the QR steady.</p>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                <label className="block text-sm font-semibold text-white/70 mb-2">Manual token entry</label>
                <div className="flex gap-2">
                  <input
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Paste QR token"
                    className="flex-1 px-4 py-3 rounded-xl bg-navy-900/60 border border-white/15 focus:border-gold-400 outline-none text-sm"
                  />
                  <button
                    onClick={() => manualToken.trim() && handleToken(manualToken)}
                    disabled={busy}
                    className="px-5 py-3 rounded-xl bg-white/10 text-gold-300 font-semibold hover:bg-white/15 transition-all text-sm disabled:opacity-40"
                  >
                    Verify
                  </button>
                </div>
                {scanError && <p className="mt-2 text-sm text-red-300">{scanError}</p>}
              </div>
            </section>

            <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <h2 className="font-display text-xl font-bold">Check-in result</h2>
              {result.kind === 'idle' && (
                <div className="mt-10 text-center text-white/30">
                  <ScanLine className="w-12 h-12 mx-auto" />
                  <p className="mt-3 text-sm">Scan a pass to see passenger details here.</p>
                </div>
              )}
              {result.kind === 'valid' && (
                <div className="mt-4">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/15 border border-green-500/40 text-green-300">
                    <CheckCircle className="w-6 h-6 shrink-0" />
                    <div>
                      <div className="font-bold">Valid ticket — checked in</div>
                      <div className="text-sm text-green-200/70">Boarding pass marked as used.</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-navy-900/60 border border-white/10 p-5 space-y-2.5 text-sm">
                    {[
                      ['Passenger', `${result.booking.first_name} ${result.booking.last_name ?? ''}`],
                      ['Flight', `${result.booking.flight_code} · PHX → ${result.booking.airport_code}`],
                      ['Destination', result.booking.destination],
                      ['Date', formatDate(result.booking.flight_date)],
                      ['Departure', result.booking.time_window],
                      ['Seat', result.booking.seat],
                      ['Reference', result.booking.booking_ref],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <span className="text-white/40">{label}</span>
                        <span className="font-semibold text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => markCompleted(result.booking)}
                    disabled={busy}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 font-bold hover:bg-green-500/30 transition-all disabled:opacity-40"
                  >
                    <Flag className="w-4 h-4" /> Mark Flight Completed
                  </button>
                </div>
              )}
              {result.kind === 'invalid' && (
                <div className="mt-4">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300">
                    <XCircle className="w-6 h-6 shrink-0" />
                    <div>
                      <div className="font-bold">Invalid ticket</div>
                      <div className="text-sm text-red-200/70">{result.reason}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-white/40">Ask the passenger to return to the kiosk and re-book if needed.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Users, label: 'Registered', value: stats.registered, color: 'text-sky-300', ring: 'border-sky-500/30 bg-sky-500/10' },
                { icon: CheckCircle2, label: 'Checked In', value: stats.checkedIn, color: 'text-green-300', ring: 'border-green-500/30 bg-green-500/10' },
                { icon: Flag, label: 'Completed', value: stats.completed, color: 'text-gold-300', ring: 'border-gold-500/30 bg-gold-500/10' },
              ].map(({ icon: Icon, label, value, color, ring }) => (
                <div key={label} className={`rounded-2xl border p-5 flex items-center gap-4 ${ring}`}>
                  <Icon className={`w-8 h-8 ${color}`} />
                  <div>
                    <div className={`font-display text-3xl font-bold ${color}`}>{value}</div>
                    <div className="text-sm text-white/50">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                <h2 className="font-display text-lg font-bold">Today's passengers</h2>
                <button
                  onClick={loadBookings}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingBookings ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
              {bookings.length === 0 && !loadingBookings ? (
                <div className="py-14 text-center text-white/30">
                  <Clock3 className="w-10 h-10 mx-auto" />
                  <p className="mt-3 text-sm">No bookings yet today.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold">Passenger</th>
                        <th className="px-6 py-3 font-semibold">Flight</th>
                        <th className="px-6 py-3 font-semibold">Destination</th>
                        <th className="px-6 py-3 font-semibold">Departure</th>
                        <th className="px-6 py-3 font-semibold">Seat</th>
                        <th className="px-6 py-3 font-semibold">Ref</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-3.5 font-semibold">
                            {b.first_name} {b.last_name ?? ''}
                          </td>
                          <td className="px-6 py-3.5 text-gold-300 font-semibold">{b.flight_code}</td>
                          <td className="px-6 py-3.5">
                            {b.destination} ({b.airport_code})
                          </td>
                          <td className="px-6 py-3.5 text-white/60">{b.time_window}</td>
                          <td className="px-6 py-3.5 font-semibold">{b.seat}</td>
                          <td className="px-6 py-3.5 text-white/50 font-mono text-xs">{b.booking_ref}</td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                b.status === 'registered'
                                  ? 'bg-sky-500/15 text-sky-300'
                                  : b.status === 'checked_in'
                                  ? 'bg-green-500/15 text-green-300'
                                  : 'bg-gold-500/15 text-gold-300'
                              }`}
                            >
                              {b.status === 'registered' ? 'Registered' : b.status === 'checked_in' ? 'Checked In' : 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-display font-bold">Test pass generator</h3>
              <p className="text-white/50 text-sm mt-1">
                Generate a sample QR token to test the scanner without booking a flight.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
                <TestPassQR />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TestPassQR() {
  const [token, setToken] = useState(randomToken(12));
  return (
    <div className="flex items-center gap-6">
      <div className="p-2.5 bg-white rounded-xl">
        <QRCodeCanvas value={token} size={110} level="M" fgColor="#0a1628" />
      </div>
      <div className="text-xs text-white/40 font-mono break-all max-w-xs">{token}</div>
      <button
        onClick={() => setToken(randomToken(12))}
        className="px-4 py-2 rounded-xl bg-white/10 text-gold-300 text-sm font-semibold hover:bg-white/15 transition-all"
      >
        New Token
      </button>
    </div>
  );
}
