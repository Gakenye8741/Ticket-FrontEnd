import { eventApi } from "../../features/APIS/EventsApi";
import { mediaApi } from "../../features/APIS/mediaApi";
import { PuffLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  CalendarDays,
  Clock,
  Building,
  MapPin,
  Users,
  Tag,
  Ticket,
} from "lucide-react";

type Venue = {
  name: string;
  address: string;
  capacity: number;
};

type EventDetails = {
  eventId: number;
  title: string;
  description?: string;
  venue?: Venue;
  category?: string;
  date: string;
  time: string;
  ticketPrice: number | string;
  ticketsTotal: number;
  ticketsSold: number;
};

export const EventCard = () => {
  const navigate = useNavigate();

  const {
    data: allEvents = [],
    isLoading,
    error,
  } = eventApi.useGetAllEventsQuery({
    pollingInterval: 3000,
  });

  const displayedEvents = allEvents.slice(0, 3);

  return (
    <section className="min-h-screen py-16 px-6 bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-cyan-400 mb-6 drop-shadow-[0_0_10px_#22d3ee]">
          Upcoming Events
        </h2>

        <p className="text-lg text-slate-200 max-w-3xl mx-auto text-center mb-10">
          At <span className="text-cyan-400 font-semibold">TicketStream</span>, we bring you the best live entertainment experiences—from electrifying concerts and inspiring conferences to unforgettable festivals and shows. Explore our curated selection of upcoming events!
        </p>

        {error ? (
          <div className="text-red-400 text-center text-lg font-semibold">
            Something went wrong. Please try again.
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#22d3ee" />
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center text-cyan-200 text-lg">No events found.</div>
        ) : (
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayedEvents.map((event: EventDetails) => (
              <EventCardItem key={event.eventId} event={event} navigate={navigate} />
            ))}
          </div>
        )}

        {allEvents.length > 3 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/events")}
              className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              See More Events
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const EventCardItem = ({
  event,
  navigate,
}: {
  event: EventDetails;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const { data: media = [] } = mediaApi.useGetMediaByEventIdQuery(event.eventId);

  const firstImage = Array.isArray(media)
    ? media.find((m: any) => m.type === "image")
    : null;

  const price = parseFloat(event.ticketPrice as string);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-cyan-400/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1 hover:scale-[1.02]">
      {firstImage ? (
        <img
          src={firstImage.url}
          alt={event.title}
          className="w-full h-48 object-cover rounded-xl mb-4 border border-cyan-600/30 shadow-md"
        />
      ) : (
        <div className="w-full h-48 bg-cyan-900/30 flex items-center justify-center text-cyan-200 rounded-xl mb-4 border border-cyan-600/30 shadow-md">
          No Image Available
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-2xl font-bold text-cyan-300 mb-1 drop-shadow">
          {event.title}
        </h3>
        <span className="text-xl font-semibold text-green-400">
          ${isNaN(price) ? "0.00" : price.toFixed(2)}
        </span>
      </div>

      <p className="text-slate-300 mb-4 line-clamp-3">
        {event.description || "No description available."}
      </p>

      {/* Horizontal flex container with items displayed side-by-side */}
      <div className="flex flex-wrap gap-3 justify-center items-center text-sm text-slate-300 border border-cyan-500/20 rounded-lg p-4 bg-black/20">
        <div className="flex flex-col items-center w-24 text-center">
          <CalendarDays className="w-5 h-5 text-cyan-400 mb-1" />
          <span>{event.date}</span>
        </div>

        <div className="flex flex-col items-center w-24 text-center">
          <Clock className="w-5 h-5 text-cyan-400 mb-1" />
          <span>{event.time}</span>
        </div>

        <div className="flex flex-col items-center w-24 text-center">
          <Building className="w-5 h-5 text-cyan-400 mb-1" />
          <span>{event.venue?.name || "N/A"}</span>
        </div>

        <div className="flex flex-col items-center w-24 text-center">
          <MapPin className="w-5 h-5 text-cyan-400 mb-1" />
          <span>{event.venue?.address || "N/A"}</span>
        </div>

        <div className="flex flex-col items-center w-24 text-center">
          <Users className="w-5 h-5 text-cyan-400 mb-1" />
          <span>{event.venue?.capacity ?? "N/A"}</span>
        </div>

        <div className="flex flex-col items-center w-24 text-center">
          <Tag className="w-5 h-5 text-cyan-400 mb-1" />
          <span>{event.category || "Uncategorized"}</span>
        </div>

        <div className="flex flex-col items-center w-24 text-center">
          <Ticket className="w-5 h-5 text-cyan-400 mb-1" />
          <span>Sold: {event.ticketsSold}</span>
        </div>

        <div className="flex flex-col items-center w-24 text-center">
          <Ticket className="w-5 h-5 text-cyan-400 mb-1" />
          <span>Available: {event.ticketsTotal - event.ticketsSold}</span>
        </div>
      </div>

      <button
        onClick={() => navigate(`/events/${event.eventId}`)}
        className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-5 h-5" />
        Book Now
      </button>
    </div>
  );
};
