import React from 'react';
import { useSelector } from 'react-redux';
import PuffLoader from 'react-spinners/PuffLoader';

import { bookingApi } from '../../features/APIS/BookingsApi';
import { userApi } from '../../features/APIS/UserApi';
import { emailApi } from '../../features/APIS/SendngEmails';
import { eventApi } from '../../features/APIS/EventsApi';
import { ticketApi } from '../../features/APIS/ticketsType.Api';

import TicketItem from './TicketsItem';
import type { RootState } from '../../App/store';


interface EnrichedBooking {
  bookingId: number;
  eventName: string;
  ticketType: {
    name: string;
    price: string;
  };
  quantity: number;
  paymentStatus: string;
  createdAt: string;
}

const TicketDisplay: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);

  const { data: bookings, isLoading: isBookingsLoading } =
    bookingApi.useGetBookingsByUserNationalIdQuery(nationalId!, { skip: !nationalId });

  const { data: user, isLoading: isUserLoading } =
    userApi.useGetUserByNationalIdQuery(nationalId!, { skip: !nationalId });

  const { data: events, isLoading: isEventsLoading } = eventApi.useGetAllEventsQuery({});
  const { data: ticketTypes, isLoading: isTicketTypesLoading } = ticketApi.useGetAllTicketTypesQuery({});

  const [sendTicketEmail, { isLoading: isEmailSending }] = emailApi.useSendTicketEmailMutation();

  const isLoading = isBookingsLoading || isUserLoading || isEventsLoading || isTicketTypesLoading;

  const enrichedBookings: EnrichedBooking[] | undefined = bookings?.map((booking) => {
    const event = events?.find((e:any) => e.eventId === booking.eventId);
    const ticketType = ticketTypes?.find((t:any) => t.ticketTypeId === booking.ticketTypeId);

    return {
      bookingId: booking.bookingId,
      eventName: event?.title || 'Unknown Event',
      ticketType: {
        name: ticketType?.name || 'Unknown',
        price: ticketType?.price || '0',
      },
      quantity: booking.quantity,
      paymentStatus: booking.bookingStatus || 'Unknown',
      createdAt: booking.createdAt,
    };
  });

  const handleSendEmail = async () => {
    if (!enrichedBookings || !user) return;

    try {
      await sendTicketEmail({ bookings: enrichedBookings, user }).unwrap();
      alert('Ticket details sent to your email!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again later.');
    }
  };

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
      <div className="flex justify-end">
        <button
          onClick={handleSendEmail}
          disabled={isEmailSending}
          className={`px-4 py-2 rounded transition ${
            isEmailSending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isEmailSending ? 'Sending...' : 'Email My Tickets'}
        </button>
      </div>
      {enrichedBookings?.map((booking) => (
        <TicketItem key={booking.bookingId} booking={booking} user={user!} />
      ))}
    </div>
  );
};

export default TicketDisplay;
