import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, CheckCircle, Clock,
  DollarSign, MapPin, Tag, XCircle, ShoppingCart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Carousel } from "react-responsive-carousel";
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

  useEffect(() => {
    if (ticketTypes && ticketTypes.length > 0) {
      setTicketTypeName(ticketTypes[0].name);
    }
  }, [ticketTypes]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to book tickets.");
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
      toast.error("Total amount must be at least $0.50.");
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
        currency: "usd",
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
    return <p className="text-white text-center mt-10 text-xl">Loading...</p>;

  if (error || !event)
    return <p className="text-red-500 text-center mt-10 text-xl">Event not found.</p>;

  const selectedTicket = ticketTypes?.find((t: any) => t.name === ticketTypeName);
  const ticketPrice = selectedTicket?.price ?? 0;
  const total = quantity * ticketPrice;

  return (
    <>
      <Navbar />
      <div className="mt-20 min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] py-12 px-4">
        <div className="max-w-7xl mx-auto bg-[#1f2937] shadow-xl rounded-2xl p-8 text-white">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition duration-200 group mb-6"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <h1 className="text-4xl font-extrabold mb-4 text-center">{event.title}</h1>
          <p className="text-gray-300 text-center mb-8 text-lg">{event.description}</p>

          {mediaData?.length > 0 && (
            <Carousel showThumbs={false} infiniteLoop autoPlay>
              {mediaData.map((media: any) => (
                <div key={media.mediaId}>
                  {media.type === "image" ? (
                    <img src={media.url} alt="event media" className="object-fit h-96 min-w-0.5" />
                  ) : (
                    <video controls className="object-cover h-96 w-full bg-black">
                      <source src={media.url} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </Carousel>
          )}

          <div className="flex flex-col lg:flex-row gap-10 mt-10">
            <div className="flex-1 space-y-4 text-lg">
              <Info icon={<Tag className="text-indigo-400" />} label="Category" value={event.category} />
              <Info icon={<Calendar className="text-green-400" />} label="Date" value={event.date} />
              <Info icon={<Clock className="text-blue-400" />} label="Time" value={event.time} />
              <Info icon={<MapPin className="text-yellow-400" />} label="Venue" value={event.venue?.name ?? "Unknown"} />
              <Info icon={<DollarSign className="text-purple-400" />} label="Base Price" value={`$${event.ticketPrice}`} />
              <Info icon={event.status === "Active" ? <CheckCircle className="text-emerald-400" /> : <XCircle className="text-rose-400" />} label="Status" value={event.status} />
            </div>

            <div className="flex-1 border-t lg:border-t-0 lg:border-l border-gray-600 pt-8 lg:pt-0 lg:pl-8">
              <h2 className="text-2xl font-bold mb-4">Book Your Ticket</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  value={user?.nationalId || ""}
                  className="input input-bordered w-full bg-[#111827] text-white"
                  readOnly
                  disabled
                />

                <input
                  type="number"
                  min={1}
                  className="input input-bordered w-full bg-[#111827] text-white"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={!isAuthenticated}
                />

                <select
                  className="select select-bordered w-full bg-[#111827] text-white"
                  value={ticketTypeName}
                  onChange={(e) => setTicketTypeName(e.target.value)}
                  disabled={!isAuthenticated}
                >
                  {ticketTypes?.map((type: any) => (
                    <option key={type.id} value={type.name}>
                      {type.name} - ${type.price}
                    </option>
                  ))}
                </select>

                {ticketTypes && ticketTypes.length > 0 && (
                  <div className="text-sm text-gray-300 bg-[#111827] p-4 rounded-lg border border-gray-600 space-y-2">
                    <p>💵 <strong>Ticket:</strong> ${ticketPrice}</p>
                    <p>#️⃣ <strong>Quantity:</strong> {quantity}</p>
                    <p>🧮 <strong>Total:</strong> ${total.toFixed(2)}</p>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                  disabled={isBooking}
                >
                  <ShoppingCart size={18} />
                  {isBooking ? "Processing..." : "Book & Pay Now"}
                </button>
              </div>
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
  <div className="flex items-center gap-3">
    {icon}
    <span><strong>{label}:</strong> {value}</span>
  </div>
);
