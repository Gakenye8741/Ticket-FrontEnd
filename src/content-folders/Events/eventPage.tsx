import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Calendar, CheckCircle, Clock,
  DollarSign, MapPin, Tag, XCircle, ShoppingCart, Phone, CreditCard, Loader2, Check
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
import { useInitiateStkPushMutation } from "../../features/APIS/MpesaApi"; 

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
  const location = useLocation();
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { data: event, isLoading, error } = eventApi.useGetEventByIdQuery(id!);
  const { data: ticketTypes } = useGetTicketTypesByEventIdQuery(id!);
  const { data: mediaData } = mediaApi.useGetMediaByEventIdQuery(id!);

  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();
  const [createCheckoutSession] = paymentApi.useCreateCheckoutSessionMutation();
  const [initiateStkPush, { isLoading: isMpesaLoading }] = useInitiateStkPushMutation();

  const [quantity, setQuantity] = useState(1);
  const [ticketTypeName, setTicketTypeName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "mpesa">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // States for Payment Tracking
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // RTK Query for polling the payment table
  const { data: paymentData } = paymentApi.useGetPaymentsByBookingIdQuery(activeBookingId!, {
    skip: !activeBookingId || !showStatusModal || isConfirmed,
    pollingInterval: 3000, // Poll every 3 seconds
    refetchOnMountOrArgChange: true, // Forces fresh data fetch
  });

  const hasTicketTypes = Array.isArray(ticketTypes) && ticketTypes.length > 0;

  // Effect to watch for successful payment in the payment table
  useEffect(() => {
    if (paymentData && Array.isArray(paymentData) && paymentData.length > 0) {
      // Corrected to check for 'paymentStatus' based on your API response
      const successfulPayment = paymentData.find(
        (p: any) => p.paymentStatus?.toLowerCase() === "completed" || p.paymentStatus?.toLowerCase() === "success"
      );

      if (successfulPayment) {
        setIsConfirmed(true);
        toast.success("Payment confirmed successfully!");
        setTimeout(() => {
          setShowStatusModal(false);
          navigate("/dashboard/Payments");
        }, 3000);
      }
    }
  }, [paymentData, navigate]);

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
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!hasTicketTypes) {
      toast.error("No ticket types available.");
      return;
    }

    if (!user?.nationalId || quantity < 1) {
      toast.error("Invalid National ID or quantity. Please update your profile.");
      return;
    }

    if (paymentMethod === "mpesa" && (!phoneNumber || phoneNumber.length < 10)) {
      toast.error("Please enter a valid phone number for M-Pesa.");
      return;
    }

    const selectedTicket = ticketTypes?.find((t: any) => t.name === ticketTypeName);
    if (!selectedTicket) {
      toast.error("Invalid ticket type selected");
      return;
    }

    const totalAmount = quantity * Number(selectedTicket.price);
    const payload: BookingPayload = {
      nationalId: Number(user.nationalId),
      eventId: Number(id),
      ticketTypeId: selectedTicket.id,
      ticketTypeName: selectedTicket.name,
      quantity,
      totalAmount: totalAmount.toString(),
    };

    try {
      const response = (await createBooking(payload).unwrap()) as unknown as BookingResponse;
      const bookingId = response.booking?.[0]?.bookingId;

      if (!bookingId) {
        toast.error("Booking ID not found.");
        return;
      }

      setActiveBookingId(bookingId);

      if (paymentMethod === "stripe") {
        const sessionPayload = {
          amount: Math.round(totalAmount * 100),
          nationalId: Number(user.nationalId),
          bookingId,
          currency: "kes",
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
        };
        const session = await createCheckoutSession(sessionPayload).unwrap();
        if (session.url) window.location.href = session.url;
      } else {
        const formattedPhone = phoneNumber.startsWith("0") 
          ? "254" + phoneNumber.slice(1) 
          : phoneNumber.startsWith("+") 
          ? phoneNumber.slice(1) 
          : phoneNumber;

        await initiateStkPush({
          phoneNumber: formattedPhone,
          amount: Math.round(totalAmount),
          bookingId,
        }).unwrap();
        
        setShowStatusModal(true);
        toast.success("STK Push initiated!");
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
      
      {/* Transaction Status Modal with Polling Logic */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-base-100 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 border border-base-300">
            <div className="flex justify-center">
              {isConfirmed ? (
                <div className="p-4 bg-success/20 rounded-full">
                  <Check className="text-success" size={48} />
                </div>
              ) : (
                <div className="p-4 bg-primary/10 rounded-full animate-pulse">
                  <Loader2 className="text-primary animate-spin" size={48} />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{isConfirmed ? "Payment Successful!" : "Awaiting Payment"}</h3>
              <p className="text-base-content/70 mt-2">
                {isConfirmed 
                  ? "Your booking is confirmed. Redirecting you now..." 
                  : `Please complete the M-Pesa prompt sent to ${phoneNumber}.`}
              </p>
            </div>
            {!isConfirmed && (
              <div className="bg-base-200 p-4 rounded-xl text-sm flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={16} />
                <p>Checking payment status for ID: {activeBookingId}...</p>
              </div>
            )}
            <button 
              onClick={() => setShowStatusModal(false)}
              className="btn btn-outline btn-block"
              disabled={isConfirmed}
            >
              {isConfirmed ? "Confirmed" : "Close & Check Later"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-20 min-h-screen bg-base-200 py-12 px-4">
        <div className="max-w-7xl mx-auto bg-base-100 shadow-lg rounded-2xl border border-base-300 p-8 text-base-content">
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline mb-6">
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

            <div className="flex-1 border border-base-300 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Complete Booking</h2>

              {!isAuthenticated && (
                <div className="text-warning text-sm bg-warning/10 p-3 rounded-lg border border-warning mb-2">
                  Please <span className="underline cursor-pointer" onClick={() => navigate("/login", { state: { from: location } })}>log in</span> to book tickets.
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-70">NATIONAL ID</label>
                <input
                  type="text"
                  value={user?.nationalId || "Not Set"}
                  className="input input-bordered w-full"
                  readOnly
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-70">QUANTITY</label>
                <input
                  type="number"
                  min={1}
                  className="input input-bordered w-full"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={!isAuthenticated}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold opacity-70">TICKET TYPE</label>
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
                  <p className="text-sm opacity-60 bg-base-200 p-4 rounded-lg">No ticket types available.</p>
                )}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`btn btn-sm flex-1 ${paymentMethod === "mpesa" ? "btn-primary" : "btn-outline"}`}
                >
                  <Phone size={14} className="mr-1" /> M-Pesa
                </button>
                <button 
                  onClick={() => setPaymentMethod("stripe")}
                  className={`btn btn-sm flex-1 ${paymentMethod === "stripe" ? "btn-primary" : "btn-outline"}`}
                >
                  <CreditCard size={14} className="mr-1" /> Card
                </button>
              </div>

              {paymentMethod === "mpesa" && (
                <div className="space-y-1">
                   <label className="text-xs font-bold opacity-70">MPESA PHONE NUMBER</label>
                   <input
                    type="text"
                    placeholder="0712345678"
                    className="input input-bordered w-full"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isAuthenticated}
                  />
                </div>
              )}

              {hasTicketTypes && (
                <div className="bg-base-200 border border-base-300 rounded-lg p-4 text-sm space-y-2">
                  <p>💵 <strong>Ticket:</strong> {formatKES(ticketPrice)}</p>
                  <p>#️⃣ <strong>Quantity:</strong> {quantity}</p>
                  <p className="text-lg font-bold">🧮 Total: {formatKES(total)}</p>
                </div>
              )}

              <button
                onClick={() => handleBooking()}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                disabled={isBooking || isMpesaLoading || !hasTicketTypes}
              >
                <ShoppingCart size={18} />
                {isBooking || isMpesaLoading ? "Processing..." : `Pay ${formatKES(total)} Now`}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const Info = ({ icon, label, value }: { icon: React.ReactElement; label: string; value: string | number }) => (
  <div className="flex items-center gap-3 text-base">
    <div className="text-primary">{icon}</div>
    <span><strong>{label}:</strong> {value}</span>
  </div>
);