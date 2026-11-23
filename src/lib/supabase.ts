import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey);

export interface Booking {
  id: string;
  booking_ref: string;
  token: string;
  flight_code: string;
  destination: string;
  airport_code: string;
  flight_date: string;
  time_window: string;
  first_name: string;
  last_name: string | null;
  seat: string;
  status: 'registered' | 'checked_in' | 'completed';
  created_at: string;
}

export async function fetchBookingsForDate(date: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('flight_date', date);
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function createBooking(b: Omit<Booking, 'id' | 'created_at' | 'status'>): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert(b)
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function findBookingByToken(token: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('token', token)
    .maybeSingle();
  if (error) throw error;
  return (data as Booking) ?? null;
}
