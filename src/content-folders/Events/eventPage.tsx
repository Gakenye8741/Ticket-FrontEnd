import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, CheckCircle, Clock,
  DollarSign, MapPin, Tag, XCircle, ShoppingCart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Carousel } from "react-responsive-carousel";
import { PuffLoader } from "react-spinners";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { eventApi } from "../../features/APIS/EventsApi";
import { useCreateBookingMutation } from "../../features/APIS/BookingsApi";
import { useGetTicketTypesByEventIdQuery } from "../../features/APIS/ticketsType.Api";
import { mediaApi } from "../../features/APIS/mediaApi";
import { paymentApi } from "../../features/APIS/PaymentApi";

import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import type { RootState } from "../../App/store";

type BookingPayload = {
  nationalId: number;
  eventId: number;
  ticketTypeId: number;
  ticketTypeName: string;
  quantity: number;
  totalAmount: string;
};

type BookingResponse = {
  booking: { bookingId: number }[];
};

const formatKES = (amount: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(amount);

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { data: event, isLoading, error } = eventApi.useGetEventByIdQuery(id!);
  const { data: ticketTypes } = useGetTicketTypesByEventIdQuery(id!);
  const { data: mediaData } = mediaApi.useGetMediaByEventIdQuery(id!);

  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();
  const [createCheckoutSession] = paymentApi.useCreateCheckoutSessionMutation();

  const [quantity, setQuantity] = useState(1);
  const [ticketTypeName, setTicketTypeName] = useState("");

  const hasTicketTypes = Array.isArray(ticketTypes) && ticketTypes.length > 0;

  useEffect(() => {
    if (hasTicketTypes) {
      setTicketTypeName(ticketTypes![0].name);
    } else {
      setTicketTypeName("");
    }
  }, [ticketTypes, hasTicketTypes]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to book tickets.");
      return;
    }

    if (!hasTicketTypes) {
      toast.error("No ticket types available.");
      return;
    }

    if (!user?.nationalId || quantity < 1) {
      toast.error("Invalid National ID or quantity");
      return;
    }

    const selectedTicket = ticketTypes?.find((t: any) => t.name === ticketTypeName);
    if (!selectedTicket) {
      toast.error("Invalid ticket type selected");
      return;
    }

    const totalAmount = quantity * Number(selectedTicket.price);
    if (totalAmount < 0.5) {
      toast.error("Total amount must be at least KSh 0.50.");
      return;
    }

    const payload: BookingPayload = {
      nationalId: Number(user.nationalId),
      eventId: Number(id),
      ticketTypeId: selectedTicket.id,
      ticketTypeName: selectedTicket.name,
      quantity,
      totalAmount: totalAmount.toString(),
    };

    try {
      const booking = (await createBooking(payload).unwrap()) as unknown as BookingResponse;
      toast.success("Booking created successfully!");
      const bookingId = booking.booking?.[0]?.bookingId;

      if (!bookingId) {
        toast.error("Booking ID not found.");
        return;
      }

      const sessionPayload = {
        amount: Math.round(totalAmount * 100),
        nationalId: Number(user.nationalId),
        bookingId,
        currency: "kes",
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
      };

      const session = await createCheckoutSession(sessionPayload).unwrap();

      if (session.url) {
        window.location.href = session.url;
      } else {
        toast.error("Stripe session creation failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Booking or payment failed.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <PuffLoader color="#6366f1" size={80} />
      </div>
    );

  if (error || !event)
    return <p className="text-error text-center mt-10 text-xl">Event not found.</p>;

  const selectedTicket = ticketTypes?.find((t: any) => t.name === ticketTypeName);
  const ticketPrice = selectedTicket?.price ?? 0;
  const total = quantity * ticketPrice;

  return (
    <>
      <Navbar />
      <div className="mt-20 min-h-screen bg-base-200 py-12 px-4">
        <div className="max-w-7xl mx-auto bg-base-100 shadow-lg rounded-2xl border border-base-300 p-8 text-base-content">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-outline mb-6"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <h1 className="text-4xl font-bold mb-2 text-center">{event.title}</h1>
          <p className="text-center text-base-content/80 mb-6">{event.description}</p>

          {mediaData?.length > 0 && (
            <Carousel showThumbs={false} infiniteLoop autoPlay>
              {mediaData.map((media: any) => (
                <div key={media.mediaId}>
                  {media.type === "image" ? (
                    <img src={media.url} alt="event media" className="object-cover h-96 w-full rounded-lg" />
                  ) : (
                    <video controls className="h-96 w-full rounded-lg bg-black">
                      <source src={media.url} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </Carousel>
          )}

          <div className="flex flex-col lg:flex-row gap-8 mt-10">
            {/* Info */}
            <div className="flex-1 space-y-4 border border-base-300 rounded-xl p-4">
              <Info icon={<Tag />} label="Category" value={event.category} />
              <Info icon={<Calendar />} label="Date" value={event.date} />
              <Info icon={<Clock />} label="Time" value={event.time} />
              <Info icon={<MapPin />} label="Venue" value={event.venue?.name ?? "Unknown"} />
              <Info icon={<DollarSign />} label="Base Price" value={`KSh ${event.ticketPrice}`} />
              <Info
                icon={event.status === "Active" ? <CheckCircle className="text-success" /> : <XCircle className="text-error" />}
                label="Status"
                value={event.status}
              />
            </div>

            {/* Booking Form */}
            <div className="flex-1 border border-base-300 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Book Your Ticket</h2>

              <input
                type="text"
                value={user?.nationalId || ""}
                className="input input-bordered w-full"
                readOnly
                disabled
              />

              <input
                type="number"
                min={1}
                className="input input-bordered w-full"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={!isAuthenticated}
              />

              {hasTicketTypes ? (
                <select
                  className="select select-bordered w-full"
                  value={ticketTypeName}
                  onChange={(e) => setTicketTypeName(e.target.value)}
                  disabled={!isAuthenticated}
                >
                  {ticketTypes!.map((type: any) => (
                    <option key={type.id} value={type.name}>
                      {type.name} - {formatKES(type.price)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-base-content/60 bg-base-200 p-4 rounded-lg border border-base-300">
                  No ticket types available.
                </p>
              )}

              {hasTicketTypes && (
                <div className="bg-base-200 border border-base-300 rounded-lg p-4 text-sm space-y-2">
                  <p>💵 <strong>Ticket:</strong> {formatKES(ticketPrice)}</p>
                  <p>#️⃣ <strong>Quantity:</strong> {quantity}</p>
                  <p>🧮 <strong>Total:</strong> {formatKES(total)}</p>
                </div>
              )}

              <button
                onClick={handleBooking}
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isBooking || !hasTicketTypes}
              >
                <ShoppingCart size={18} />
                {!hasTicketTypes ? "No ticket types available" : isBooking ? "Processing..." : "Book & Pay Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

interface InfoProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
}

const Info = ({ icon, label, value }: InfoProps) => (
  <div className="flex items-center gap-3 text-base">
    <div className="text-primary">{icon}</div>
    <span><strong>{label}:</strong> {value}</span>
  </div>
);
