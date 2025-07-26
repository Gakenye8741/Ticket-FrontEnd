import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PuffLoader from 'react-spinners/PuffLoader';

import { eventApi } from '../../features/APIS/EventsApi';
import { ticketApi } from '../../features/APIS/ticketsType.Api';
import { paymentApi } from '../../features/APIS/PaymentApi';

import TicketDocument from './TicketDocument';
import type { Booking, User, Event, TicketType } from './types';

interface TicketItemProps {
  booking: Booking;
  user: User;
}

const TicketItem: React.FC<TicketItemProps> = ({ booking, user }) => {
  const { data: event, isLoading: isEventLoading } =
    eventApi.useGetEventByIdQuery(booking.eventId);

  const { data: ticketType, isLoading: isTicketTypeLoading } =
    ticketApi.useGetTicketTypeByIdQuery(booking.ticketTypeId);

  const { data: payments, isLoading: isPaymentsLoading } =
    paymentApi.useGetPaymentsByBookingIdQuery(booking.bookingId);

  if (isEventLoading || isTicketTypeLoading || isPaymentsLoading) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-xl shadow-sm">
        <PuffLoader size={40} color="#10b981" />
      </div>
    );
  }

  const ticketPrice = parseFloat(ticketType?.price || '0');
  const total = ticketPrice * booking.quantity;
  const paymentStatus = payments?.[0]?.paymentStatus || 'Unknown';

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-indigo-600 mb-3">
        🎟 {event?.title || 'Event'}
      </h2>

      <p className="text-sm text-gray-800"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p className="text-sm text-gray-800"><strong>National ID:</strong> {user.nationalId}</p>
      <p className="text-sm text-gray-800"><strong>Ticket Type:</strong> {ticketType?.name}</p>
      <p className="text-sm text-gray-800"><strong>Quantity:</strong> {booking.quantity}</p>
      <p className="text-sm text-gray-800"><strong>Price per ticket:</strong> ${ticketPrice.toFixed(2)}</p>
      <p className="text-sm text-gray-800"><strong>Total:</strong> ${total.toFixed(2)}</p>
      <p className="text-sm text-gray-800"><strong>Payment Status:</strong> {paymentStatus}</p>
      <p className="text-sm text-gray-800"><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>

      <div className="mt-4">
        <PDFDownloadLink
          document={
            <TicketDocument
              user={user}
              event={event as Event}
              ticketType={ticketType as TicketType}
              booking={booking}
              total={total}
              paymentStatus={paymentStatus}
            />
          }
          fileName={`ticket-${booking.bookingId}.pdf`}
        >
          {({ loading }) =>
            loading ? (
              'Preparing ticket...'
            ) : (
              <button className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition">
                Download Ticket PDF
              </button>
            )
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default TicketItem;
