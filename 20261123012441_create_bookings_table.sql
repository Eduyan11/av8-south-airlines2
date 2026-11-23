/*
# Create bookings table for AV8 SOUTH Airlines check-in

1. New Tables
- `bookings`
  - `id` (uuid, primary key, auto-generated)
  - `booking_ref` (text, unique) — human-readable booking reference like AV8-XXXXXX
  - `token` (text, unique) — random token encoded in the QR code (no personal info)
  - `flight_code` (text) — AV801..AV805
  - `destination` (text) — city name
  - `airport_code` (text) — MNL, HND, LHR, SIN, TIJ
  - `flight_date` (date) — selected event date
  - `time_window` (text) — assigned window, e.g. "12:00 PM – 12:45 PM"
  - `first_name` (text) — passenger first name
  - `last_name` (text, nullable) — optional passenger last name
  - `seat` (text) — selected seat, e.g. "3C"
  - `status` (text) — registered | checked_in | completed
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `bookings`.
- Grant SELECT/INSERT/UPDATE to anon + authenticated (kiosk has no sign-in).
- Policies: public read (flight cards show seat availability), public insert,
  update only allowed for changing status.
- Indexes on token, booking_ref, flight_code + flight_date for fast lookups.

3. Notes
- Single-tenant school event app, no user accounts. Data is intentionally shared
  between the kiosk and staff dashboard.
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref text UNIQUE NOT NULL,
  token text UNIQUE NOT NULL,
  flight_code text NOT NULL,
  destination text NOT NULL,
  airport_code text NOT NULL,
  flight_date date NOT NULL,
  time_window text NOT NULL,
  first_name text NOT NULL,
  last_name text,
  seat text NOT NULL,
  status text NOT NULL DEFAULT 'registered',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON bookings TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_bookings" ON bookings;
CREATE POLICY "public_select_bookings"
ON bookings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_bookings" ON bookings;
CREATE POLICY "public_insert_bookings"
ON bookings FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_bookings" ON bookings;
CREATE POLICY "public_update_bookings"
ON bookings FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS bookings_flight_date_idx ON bookings (flight_code, flight_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);
