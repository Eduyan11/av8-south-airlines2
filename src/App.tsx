import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from '@/context/BookingContext';
import Welcome from '@/pages/Welcome';
import DatePage from '@/pages/DatePage';
import FlightPage from '@/pages/FlightPage';
import PassengerPage from '@/pages/PassengerPage';
import SeatPage from '@/pages/SeatPage';
import ConfirmPage from '@/pages/ConfirmPage';
import BoardingPassPage from '@/pages/BoardingPassPage';
import StaffPage from '@/pages/StaffPage';

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/book/date" element={<DatePage />} />
          <Route path="/book/flights" element={<FlightPage />} />
          <Route path="/book/passenger" element={<PassengerPage />} />
          <Route path="/book/seats" element={<SeatPage />} />
          <Route path="/book/confirm" element={<ConfirmPage />} />
          <Route path="/boarding-pass" element={<BoardingPassPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  );
}
