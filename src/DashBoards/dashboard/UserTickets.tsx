import React from 'react';
import { useSelector } from 'react-redux';
import PuffLoader from 'react-spinners/PuffLoader';

import { bookingApi } from '../../features/APIS/BookingsApi';
import { userApi } from '../../features/APIS/UserApi';
import TicketItem from './TicketsItem';

import type { Booking } from './types';
import type { RootState } from '../../App/store';

const TicketDisplay: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);

  const { data: bookings, isLoading: isBookingsLoading } =
    bookingApi.useGetBookingsByUserNationalIdQuery(nationalId!, { skip: !nationalId });

  const { data: user, isLoading: isUserLoading } =
    userApi.useGetUserByNationalIdQuery(nationalId!, { skip: !nationalId });

  const isLoading = isBookingsLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PuffLoader size={80} color="#4f46e5" />
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10 text-lg">
        No bookings found for this user.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto mt-20">
      {bookings.map((booking: Booking) => (
        <TicketItem key={booking.bookingId} booking={booking} user={user!} />
      ))}
    </div>
  );
};

export default TicketDisplay;
