import { useState } from "react";
import { PuffLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { CgShoppingCart } from "react-icons/cg";
import { FaSignInAlt } from "react-icons/fa";
import dayjs from "dayjs";
import { eventApi } from "../../features/APIS/EventsApi";

import { useSelector } from "react-redux";
import type { RootState } from "../../App/store";
import { mediaApi } from "../../features/APIS/mediaApi";

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

const getEventStatus = (event: EventDetails) => {
  const eventDateTime = dayjs(`${event.date} ${event.time}`);
  const now = dayjs();
  if (eventDateTime.isBefore(now)) return "past";
  if (eventDateTime.isSame(now, "day")) return "ongoing";
  return "upcoming";
};

const EventCard = ({
  event,
  isAuthenticated,
  navigate,
}: {
  event: EventDetails;
  isAuthenticated: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const { data: media = [] } = mediaApi.useGetMediaByEventIdQuery(event.eventId);
  const firstImageUrl = media.length > 0 ? media[0].url : null;

  const price = parseFloat(event.ticketPrice as string);
  const status = getEventStatus(event);
  const isPast = status === "past";
  const statusText =
    status === "past" ? "Event Ended" : status === "ongoing" ? "Ongoing" : "Upcoming";
  const statusColor =
    status === "past"
      ? "bg-gray-600 text-gray-300"
      : status === "ongoing"
      ? "bg-yellow-500 text-black"
      : "bg-green-400 text-black";

  return (
    <div
      key={event.eventId}
      className="relative bg-white/5 backdrop-blur-md border border-cyan-400/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1 hover:scale-[1.02]"
    >
      {firstImageUrl && (
        <img
          src={firstImageUrl}
          alt={event.title}
          className="w-full h-48 object-cover rounded-xl mb-4 border border-cyan-400/30"
        />
      )}

      <div className="mb-4">
        <h3 className="text-2xl font-bold text-cyan-300 mb-1 drop-shadow">{event.title}</h3>
        <span className="text-xl font-semibold text-green-400">
          ${isNaN(price) ? "0.00" : price.toFixed(2)}
        </span>
      </div>

      <p className="text-slate-300 mb-4 line-clamp-3">
        {event.description || "No description available."}
      </p>

      <div className="flex flex-wrap gap-1 justify-between items-start text-sm text-slate-300 border border-cyan-500/20 rounded-lg p-4 bg-black/20 mb-6">
        <div className="flex flex-col items-center w-24 text-center">
          <span className="text-cyan-400 text-lg">📅</span>
          <span>{event.date}</span>
        </div>
        <div className="flex flex-col items-center w-24 text-center">
          <span className="text-cyan-400 text-lg">⏰</span>
          <span>{event.time}</span>
        </div>
        <div className="flex flex-col items-center w-24 text-center">
          <span className="text-cyan-400 text-lg">🏟️</span>
          <span>{event.venue?.name || "N/A"}</span>
        </div>
        <div className="flex flex-col items-center w-24 text-center">
          <span className="text-cyan-400 text-lg">📍</span>
          <span>{event.venue?.address || "N/A"}</span>
        </div>
        <div className="flex flex-col items-center w-24 text-center">
          <span className="text-cyan-400 text-lg">👥</span>
          <span>{event.venue?.capacity ?? "N/A"}</span>
        </div>
        <div className="flex flex-col items-center w-24 text-center">
          <span className="text-cyan-400 text-lg">🏷️</span>
          <span>{event.category || "Uncategorized"}</span>
        </div>
        <div className="flex flex-col items-center w-24 text-center">
          <span className="text-cyan-400 text-lg">🎟️</span>
          <span>Sold: {event.ticketsSold}</span>
        </div>
        <div className="flex flex-col items-center w-24 text-center">
          <span className="text-cyan-400 text-lg">🎟️</span>
          <span>Available: {event.ticketsTotal - event.ticketsSold}</span>
        </div>
      </div>

      {isAuthenticated ? (
        <button
          onClick={() => !isPast && navigate(`/events/${event.eventId}`)}
          className={`w-full py-2 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition ${
            isPast
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
          }`}
          disabled={isPast}
        >
          <CgShoppingCart className="text-lg" />
          {isPast ? "Event Ended" : "Book Ticket"}
        </button>
      ) : (
        <a
          href="/login"
          className="w-full block text-center py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow hover:shadow-lg hover:from-cyan-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
        >
          <FaSignInAlt className="text-lg" />
          Sign in to Book
        </a>
      )}

      <span className={`absolute top-2 right-2 py-1 px-3 rounded-full text-sm font-semibold ${statusColor}`}>
        {statusText}
      </span>
    </div>
  );
};

export const EventDetailsPage = () => {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const {
    data: eventsByTitle = [],
    isFetching: isTitleSearching,
  } = eventApi.useGetEventsByTitleQuery(searchTitle, { skip: !searchTitle });

  const {
    data: eventsByCategory = [],
    isFetching: isCategorySearching,
  } = eventApi.useGetEventsByCategoryQuery(searchCategory, { skip: !searchCategory });

  const {
    data: allEvents = [],
    isLoading,
    error,
  } = eventApi.useGetAllEventsQuery(undefined, {
    skip: !!searchTitle || !!searchCategory,
  });

  const eventsToDisplay = searchTitle
    ? eventsByTitle
    : searchCategory
    ? eventsByCategory
    : allEvents;

  const ongoingEvents = eventsToDisplay.filter((e: EventDetails) => getEventStatus(e) === "ongoing");
  const upcomingEvents = eventsToDisplay.filter((e: EventDetails) => getEventStatus(e) === "upcoming");
  const pastEvents = eventsToDisplay.filter((e: EventDetails) => getEventStatus(e) === "past");

  return (
    <section className="min-h-screen py-16 px-6 bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-cyan-400 mb-6 drop-shadow-[0_0_10px_#22d3ee]">
          Browse Events
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
          <input
            type="text"
            placeholder="Search by title..."
            className="input input-bordered w-full md:w-1/3 bg-gray-800 text-white border-cyan-400"
            value={searchTitle}
            onChange={(e) => {
              setSearchTitle(e.target.value);
              setSearchCategory("");
            }}
          />
          <input
            type="text"
            placeholder="Search by category..."
            className="input input-bordered w-full md:w-1/3 bg-gray-800 text-white border-cyan-400"
            value={searchCategory}
            onChange={(e) => {
              setSearchCategory(e.target.value);
              setSearchTitle("");
            }}
          />
          {(searchTitle || searchCategory) && (
            <button
              onClick={() => {
                setSearchTitle("");
                setSearchCategory("");
              }}
              className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
            >
              Clear Filters
            </button>
          )}
        </div>

        {error ? (
          <div className="text-red-400 text-center text-lg font-semibold">Something went wrong. Please try again.</div>
        ) : isLoading || isTitleSearching || isCategorySearching ? (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#22d3ee" />
          </div>
        ) : eventsToDisplay.length === 0 ? (
          <div className="text-center text-cyan-200 text-lg">No events found.</div>
        ) : (
          <>
            {ongoingEvents.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-cyan-400 mb-2 mt-10">Ongoing Events</h3>
                <p className="text-slate-400 mb-6">These events are currently taking place.</p>
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {ongoingEvents.map((event: EventDetails) => (
                    <EventCard key={event.eventId} event={event} isAuthenticated={isAuthenticated} navigate={navigate} />
                  ))}
                </div>
              </>
            )}
            {upcomingEvents.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-green-400 mb-2 mt-10">Upcoming Events</h3>
                <p className="text-slate-400 mb-6">These events are scheduled for the future. Book your tickets now!</p>
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event: EventDetails) => (
                    <EventCard key={event.eventId} event={event} isAuthenticated={isAuthenticated} navigate={navigate} />
                  ))}
                </div>
              </>
            )}
            {pastEvents.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-gray-400 mb-2 mt-10">Past Events</h3>
                <p className="text-slate-500 mb-6">These events have already concluded.</p>
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event:EventDetails) => (
                    <EventCard key={event.eventId} event={event} isAuthenticated={isAuthenticated} navigate={navigate} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};
