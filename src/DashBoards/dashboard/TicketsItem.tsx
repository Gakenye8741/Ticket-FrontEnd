import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useSendTicketEmailMutation } from '../../features/APIS/SendngEmails';
import TicketDocument from './TicketDocument';
import type { User } from './types';

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

interface TicketItemProps {
  booking: EnrichedBooking;
  user: User;
}

const TicketItem: React.FC<TicketItemProps> = ({ booking, user }) => {
  const [sendTicketEmail, { isLoading: isSending }] = useSendTicketEmailMutation();
  const [emailSent, setEmailSent] = useState(false);

  const ticketPrice = parseFloat(booking.ticketType.price);
  const total = ticketPrice * booking.quantity;
  const paymentStatus = booking.paymentStatus;

  const handleSendThisTicket = async () => {
    try {
      await sendTicketEmail({
        bookings: [
          {
            bookingId: booking.bookingId.toString(),
            event: { title: booking.eventName }, // ✅ send event object
            ticketType: booking.ticketType,
            quantity: booking.quantity,
            paymentStatus,
            createdAt: booking.createdAt,
          },
        ],
        user,
      }).unwrap();

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (err) {
      console.error('Failed to email ticket', err);
      alert('Failed to send ticket email.');
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-indigo-600 mb-3">🎟 {booking.eventName}</h2>

      <p className="text-sm text-gray-800"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p className="text-sm text-gray-800"><strong>National ID:</strong> {user.nationalId}</p>
      <p className="text-sm text-gray-800"><strong>Ticket Type:</strong> {booking.ticketType.name}</p>
      <p className="text-sm text-gray-800"><strong>Quantity:</strong> {booking.quantity}</p>
      <p className="text-sm text-gray-800"><strong>Price per ticket:</strong> ${ticketPrice.toFixed(2)}</p>
      <p className="text-sm text-gray-800"><strong>Total:</strong> ${total.toFixed(2)}</p>
      <p className="text-sm text-gray-800"><strong>Payment Status:</strong> {paymentStatus}</p>
      <p className="text-sm text-gray-800"><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>

      <div className="mt-4 flex gap-3">
        <PDFDownloadLink
          document={
            <TicketDocument
              user={user}
              event={{ title: booking.eventName }}
              ticketType={booking.ticketType}
              booking={{
                bookingId: booking.bookingId,
                eventId: 0,
                ticketTypeId: 0,
                quantity: booking.quantity,
                createdAt: booking.createdAt,
              }}
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
              <button className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition">
                Download Ticket PDF
              </button>
            )
          }
        </PDFDownloadLink>

        <button
          onClick={handleSendThisTicket}
          disabled={isSending}
          className={`py-2 px-4 rounded ${
            isSending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isSending ? 'Sending...' : emailSent ? 'Sent ✔️' : 'Email This Ticket'}
        </button>
      </div>
    </div>
  );
};

export default TicketItem;
