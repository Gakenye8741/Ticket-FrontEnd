import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Toaster, toast } from "react-hot-toast";

import {
  useGetBookingsByUserNationalIdQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
} from "../../features/APIS/BookingsApi";

import { eventApi } from "../../features/APIS/EventsApi";
import { ticketApi } from "../../features/APIS/ticketsType.Api";
import { paymentApi } from "../../features/APIS/PaymentApi";

interface BookingData {
  bookingId: number;
  eventId: number;
  quantity: number;
  totalAmount: string;
  bookingStatus: "Pending" | "Confirmed" | "Cancelled";
  ticketTypeId: number;
  createdAt: string;
}

interface TicketTypeData {
  ticketTypeId: number;
  name: string;
  price: number;
}

interface EventData {
  eventId: number;
  title: string;
}

const BookingsByNationalId: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [searchNationalId, setSearchNationalId] = useState<number | null>(null);

  const {
    data: bookings,
    error,
    isLoading,
    isSuccess,
  } = useGetBookingsByUserNationalIdQuery(searchNationalId!, {
    skip: searchNationalId === null,
  });

  const { data: events } = eventApi.useGetAllEventsQuery({});
  const { data: ticketTypes } = ticketApi.useGetAllTicketTypesQuery({});
  const { data: payments } = paymentApi.useGetPaymentsByNationalIdQuery(user?.nationalId, {
    skip: !user?.nationalId,
  });

  const [updateBooking] = useUpdateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();

  useEffect(() => {
    if (user?.nationalId) {
      setSearchNationalId(user.nationalId);
    }
  }, [user]);

  useEffect(() => {
    if (!bookings || !payments || !user?.nationalId) return;

    bookings.forEach((booking: BookingData) => {
      const completedPayment = payments.find(
        (payment: any) =>
          payment.bookingId === booking.bookingId &&
          payment.paymentStatus === "Completed"
      );

      if (completedPayment && booking.bookingStatus === "Pending") {
        updateBooking({
          bookingId: booking.bookingId,
          body: {
            bookingStatus: "Confirmed",
            quantity: booking.quantity,
            totalAmount: booking.totalAmount,
            ticketTypeId: booking.ticketTypeId,
            eventId: booking.eventId,
            nationalId: user.nationalId,
          },
        })
          .unwrap()
          .then(() => {
            toast.success(`✅ Booking #${booking.bookingId} auto-confirmed!`, {
              duration: 4000,
              style: {
                background: "#1f2937",
                color: "#a7f3d0",
              },
            });
          })
          .catch((err) => {
            console.error(`Failed to confirm booking #${booking.bookingId}`, err);
          });
      }
    });
  }, [bookings, payments, updateBooking, user?.nationalId]);

  const handleEditClick = async (booking: BookingData) => {
    if (!ticketTypes) {
      Swal.fire("Error", "Ticket types not loaded yet.", "error");
      return;
    }

    if (booking.bookingStatus !== "Pending") {
      Swal.fire("Not Editable", "Only pending bookings can be edited.", "warning");
      return;
    }

    const ticketOptions = ticketTypes
      .map(
        (ticket: TicketTypeData) =>
          `<option value="${ticket.ticketTypeId}" ${
            ticket.ticketTypeId === booking.ticketTypeId ? "selected" : ""
          }>${ticket.name}</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Edit Booking",
      html: `
        <input id="quantity" class="swal2-input" type="number" min="1" value="${booking.quantity}">
        <select id="ticketTypeId" class="swal2-input">${ticketOptions}</select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      preConfirm: () => {
        const quantity = Number((document.getElementById("quantity") as HTMLInputElement).value);
        const ticketTypeId = Number(
          (document.getElementById("ticketTypeId") as HTMLSelectElement).value
        );
        if (!quantity || quantity < 1) {
          Swal.showValidationMessage("Quantity must be at least 1");
          return;
        }
        return { quantity, ticketTypeId };
      },
    });

    if (!formValues) return;

    const newTicket = ticketTypes.find(
      (t: TicketTypeData) => t.ticketTypeId === formValues.ticketTypeId
    );
    const totalAmount = ((newTicket?.price || 0) * formValues.quantity).toFixed(2);

    try {
      await updateBooking({
        bookingId: booking.bookingId,
        body: {
          quantity: formValues.quantity,
          totalAmount,
          bookingStatus: booking.bookingStatus,
          ticketTypeId: formValues.ticketTypeId,
          eventId: booking.eventId,
          nationalId: user.nationalId,
        },
      }).unwrap();
      Swal.fire("Success", "Booking updated.", "success");
    } catch {
      Swal.fire("Error", "Update failed.", "error");
    }
  };

  const handleCancel = async (bookingId: number) => {
    const booking = bookings?.find((b: BookingData) => b.bookingId === bookingId);
    if (!booking || booking.bookingStatus !== "Pending") {
      Swal.fire("Not Allowed", "Only pending bookings can be cancelled.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Cancel booking?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await cancelBooking(bookingId).unwrap();
      Swal.fire("Cancelled", "Booking cancelled successfully.", "success");
    } catch {
      Swal.fire("Error", "Failed to cancel booking.", "error");
    }
  };

  const renderError = () => {
    if (!error || !("status" in error)) return null;
    if (error.data && typeof error.data === "object" && "error" in error.data) {
      return (error.data as { error?: string }).error;
    }
    return "Error loading bookings.";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white relative animate-fadeIn"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1950&h=1300&q=80')",
      }}
    >
      <Toaster />
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative z-10 max-w-7xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl p-6">
        <h2 className="text-3xl font-bold text-teal-400 mb-6">Bookings for National ID</h2>

        {isLoading && <p className="text-teal-200">Loading...</p>}
        {renderError() && <p className="text-red-400">{renderError()}</p>}

        {isSuccess && bookings?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white">
              <thead>
                <tr className="bg-white/10 text-teal-300 uppercase text-xs">
                  <th className="px-4 py-2 text-left">Booking ID</th>
                  <th className="px-4 py-2 text-left">Event</th>
                  <th className="px-4 py-2 text-left">Ticket</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Qty</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: BookingData) => {
                  const event = events?.find((e: EventData) => e.eventId === booking.eventId);
                  const ticket = ticketTypes?.find(
                    (t: TicketTypeData) => t.ticketTypeId === booking.ticketTypeId
                  );
                  const price = Number(ticket?.price) || 0;

                  return (
                    <tr
                      key={booking.bookingId}
                      className="border-b border-white/10 hover:bg-white/5 transition duration-300"
                    >
                      <td className="px-4 py-2">{booking.bookingId}</td>
                      <td className="px-4 py-2">{event?.title ?? "Unknown"}</td>
                      <td className="px-4 py-2">{ticket?.name ?? "Unknown"}</td>
                      <td className="px-4 py-2">${price.toFixed(2)}</td>
                      <td className="px-4 py-2">{booking.quantity}</td>
                      <td className="px-4 py-2">${Number(booking.totalAmount).toFixed(2)}</td>
                      <td className="px-4 py-2">{booking.bookingStatus}</td>
                      <td className="px-4 py-2">
                        {new Date(booking.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => handleEditClick(booking)}
                          disabled={booking.bookingStatus !== "Pending"}
                          className={`px-3 py-1 rounded text-white text-xs transition duration-200 ${
                            booking.bookingStatus !== "Pending"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }`}
                        >
                          Edit
                        </button>
                        {booking.bookingStatus === "Pending" && (
                          <button
                            onClick={() => handleCancel(booking.bookingId)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs transition duration-200"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-teal-200">No bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default BookingsByNationalId;
