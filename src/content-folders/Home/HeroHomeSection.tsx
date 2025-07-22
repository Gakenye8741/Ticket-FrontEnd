import '../../animations/TrueFocus.css';
import TrueFocus from '../../animations/TextFocus';
import { useSelector } from 'react-redux';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { RootState } from '../../App/store';
import { eventApi } from '../../features/APIS/EventsApi';

const backgroundImage =
  'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1920&q=80';

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
  const firstName = user?.firstName ?? 'Unknown User';

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 16) return 'Good Afternoon';
    return 'Hey';
  })();

  const [search, setSearch] = useState('');

  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = eventApi.useGetAllEventsQuery(undefined);

  /**
   * Utility — safely extract an ISO‐parsable date from the event regardless of the backend key name.
   * Falls back to Unix epoch (Jan 1 1970) if the value is missing or invalid so the event is treated as past.
   */
  const getEventDate = (e: any): Date => {
    const dateLike: string | number | undefined =
      e.date ?? e.startDate ?? e.eventDate ?? e.event_date ?? e.start_date;
    const d = new Date(dateLike ?? 0);
    return isNaN(d.valueOf()) ? new Date(0) : d;
  };

  /**
   * Memoised list of events that:
   *   1. Are TODAY or in the FUTURE (date >= now);
   *   2. Match the search query (case‐insensitive title match);
   *   3. Sorted by soonest upcoming first;
   *   4. Limited to the latest 5 items.
   */
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return (
      events
        // 1. exclude past events
        .filter((evt: any) => getEventDate(evt) >= now)
        // 2. match search if provided
        .filter((evt: any) =>
          search.trim()
            ? evt.title?.toLowerCase().includes(search.toLowerCase())
            : true
        )
        // 3. sort by date ascending (soonest first)
        .sort(
          (a: any, b: any) => getEventDate(a).getTime() - getEventDate(b).getTime()
        )
        // 4. take only the latest 5
        .slice(0, 5)
    );
  }, [events, search]);

  const hasSearch = search.trim().length > 0;

  // Util to get correct ID irrespective of backend naming (id, eventId, _id)
  const getEventId = (e: any) => e.eventId ?? e.id ?? e._id;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-10" />

      <div className="relative z-20 text-center px-6">
        <TrueFocus
          sentence="TicketStream 🎫 Events And Ticketing Management System"
          manualMode={false}
          blurAmount={2}
          borderColor="cyan"
          animationDuration={2}
          pauseBetweenAnimations={2}
        />

        <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Left Side */}
          <div className="flex-1 text-white text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-300 mb-6 drop-shadow">
              {greeting}, {firstName}
            </h1>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Welcome to <span className="text-accent font-semibold">TicketStream 🎫</span> — your ultimate platform for effortless event and ticketing management.
              <br />
              <br />
              Whether it’s a festival or a meetup, our tools help you sell tickets and promote your events like a pro.
            </p>
            <Link
              to="/events"
              className="btn bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition"
            >
              Get Started
            </Link>
          </div>

          {/* Right Side: Search */}
          <div className="flex-1 text-white">
            <input
              type="text"
              placeholder="Search events by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-lg shadow-md border border-white/20 bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />

            {isLoading && <p className="text-cyan-300">Loading events...</p>}
            {isError && (
              <p className="text-red-300">
                {(error as { status?: string })?.status || 'Failed to load events'}
              </p>
            )}

            {/* Inform user when events have been found */}
            {!isLoading && hasSearch && filteredEvents.length > 0 && (
              <>
                <p className="text-green-300 mb-2">
                  Showing {filteredEvents.length} of the latest upcoming event{filteredEvents.length > 1 ? 's' : ''} matching “{search}”.
                </p>
                <Link
                  to="/events"
                  className="inline-block mb-4 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-2 px-6 rounded-xl shadow transition"
                >
                  View All Events
                </Link>
              </>
            )}

            {!isLoading && hasSearch && filteredEvents.length === 0 && (
              <p className="text-red-200">No matching upcoming events found.</p>
            )}

            {!isLoading && filteredEvents.length > 0 && (
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 text-left">
                {filteredEvents.map((evt: any) => (
                  <li
                    key={getEventId(evt)}
                    className="bg-cyan-700/30 px-4 py-2 rounded-md hover:bg-cyan-600/40 transition"
                  >
                    <Link to={`/events/${getEventId(evt)}`} className="block w-full">
                      {evt.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
