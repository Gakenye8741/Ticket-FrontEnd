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
      ? "bg-base-300 text-base-content"
      : status === "ongoing"
      ? "bg-warning text-black"
      : "bg-success text-black";

  return (
    <div className="relative bg-base-200 border border-primary rounded-xl p-5 shadow-lg hover:shadow-xl transition hover:-translate-y-1 hover:scale-105 duration-300">
      {firstImageUrl && (
        <img
          src={firstImageUrl}
          alt={event.title}
          className="w-full h-48 object-cover rounded-lg mb-4 border border-primary/30"
        />
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary">{event.title}</h3>
        <p className="text-lg font-semibold text-accent">
          ${isNaN(price) ? "0.00" : price.toFixed(2)}
        </p>
      </div>

      <p className="text-base-content text-opacity-80 mb-4 line-clamp-3">
        {event.description || "No description available."}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm text-base-content bg-base-100 border border-base-300 rounded-lg p-4 mb-6">
        <div className="flex flex-col items-center text-center">
          📅 <span>{event.date}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          ⏰ <span>{event.time}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          🏟️ <span>{event.venue?.name || "N/A"}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          📍 <span>{event.venue?.address || "N/A"}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          👥 capapcity<span>{event.venue?.capacity ?? "N/A"}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          🏷️ <span>{event.category || "Uncategorized"}</span>
        </div>
        {/* <div className="flex flex-col items-center text-center">
          🎟️ <span>Sold: {event.ticketsSold}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          🎟️ <span>Available: {event.ticketsTotal - event.ticketsSold}</span>
        </div> */}
      </div>

      {isAuthenticated ? (
        <button
          onClick={() => !isPast && navigate(`/events/${event.eventId}`)}
          className={`btn w-full font-semibold ${
            isPast ? "btn-disabled" : "btn-primary"
          } flex items-center justify-center gap-2`}
          disabled={isPast}
        >
          <CgShoppingCart className="text-lg" />
          {isPast ? "Event Ended" : "Book Ticket"}
        </button>
      ) : (
        <a
          href="/login"
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <FaSignInAlt className="text-lg" />
          Sign in to Book
        </a>
      )}

      <span
        className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}
      >
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
    <section className="min-h-screen py-16 px-6 bg-base-100 text-base-content">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-primary text-center mb-10">
          Browse Events
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
          <input
            type="text"
            placeholder="Search by title..."
            className="input input-bordered w-full md:w-1/3"
            value={searchTitle}
            onChange={(e) => {
              setSearchTitle(e.target.value);
              setSearchCategory("");
            }}
          />
          <input
            type="text"
            placeholder="Search by category..."
            className="input input-bordered w-full md:w-1/3"
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
              className="btn btn-error btn-sm"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* State Feedback */}
        {error ? (
          <div className="text-error text-center font-semibold">
            Something went wrong. Please try again.
          </div>
        ) : isLoading || isTitleSearching || isCategorySearching ? (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#22d3ee" />
          </div>
        ) : eventsToDisplay.length === 0 ? (
          <div className="text-center text-info text-lg">No events found.</div>
        ) : (
          <>
            {ongoingEvents.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-warning mb-2 mt-10">Ongoing Events</h3>
                <p className="text-base-content text-opacity-70 mb-6">These events are currently taking place.</p>
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {ongoingEvents.map((event: EventDetails) => (
                    <EventCard key={event.eventId} event={event} isAuthenticated={isAuthenticated} navigate={navigate} />
                  ))}
                </div>
              </>
            )}
            {upcomingEvents.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-success mb-2 mt-10">Upcoming Events</h3>
                <p className="text-base-content text-opacity-70 mb-6">Book your tickets now for future events!</p>
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event: EventDetails) => (
                    <EventCard key={event.eventId} event={event} isAuthenticated={isAuthenticated} navigate={navigate} />
                  ))}
                </div>
              </>
            )}
            {pastEvents.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-base-content mb-2 mt-10">Past Events</h3>
                <p className="text-base-content text-opacity-50 mb-6">These events have already concluded.</p>
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event: EventDetails) => (
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
