import '../../animations/TrueFocus.css';
import TrueFocus from '../../animations/TextFocus';
import { useSelector } from 'react-redux';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Puff } from 'react-loader-spinner';
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

  const getEventDate = (e: any): Date => {
    const dateLike: string | number | undefined =
      e.date ?? e.startDate ?? e.eventDate ?? e.event_date ?? e.start_date;
    const d = new Date(dateLike ?? 0);
    return isNaN(d.valueOf()) ? new Date(0) : d;
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return (
      events
        .filter((evt: any) => getEventDate(evt) >= now)
        .filter((evt: any) =>
          search.trim()
            ? evt.title?.toLowerCase().includes(search.toLowerCase())
            : true
        )
        .sort(
          (a: any, b: any) => getEventDate(a).getTime() - getEventDate(b).getTime()
        )
        .slice(0, 5)
    );
  }, [events, search]);

  const hasSearch = search.trim().length > 0;

  const getEventId = (e: any) => e.eventId ?? e.id ?? e._id;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-base-100 text-base-content overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-base-100/60 backdrop-blur z-10" />

      <div className="relative z-20 text-center px-6 animate-fadeIn">
        <TrueFocus
          sentence="TicketStream 🎫 Events And Ticketing Management System"
          manualMode={false}
          blurAmount={2}
          borderColor="cyan"
          animationDuration={2}
          pauseBetweenAnimations={2}
        />

        <div className="mt-12 bg-base-200/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-base-300 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 animate-fadeInUp">
          <div className="flex-1 text-left space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary animate-fadeInUp">
              {greeting}, {firstName}
            </h1>
            <p className="leading-relaxed animate-fadeInUp">
              Welcome to <span className="text-accent font-semibold">TicketStream 🎫</span> — your ultimate platform for effortless event and ticketing management.
              <br />
              <br />
              Whether it’s a festival or a meetup, our tools help you sell tickets and promote your events like a pro.
            </p>
            <Link
              to="/events"
              className="btn btn-primary font-bold py-2 px-6 rounded-xl shadow transition animate-fadeInUp"
            >
              Get Started
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            <input
              type="text"
              placeholder="Search events by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full text-base-content animate-fadeInUp"
            />

            {isLoading && (
              <div className="flex justify-center items-center py-10 animate-fadeIn">
                <Puff
                  height={60}
                  width={60}
                  radius={1}
                  color="#06b6d4"
                  ariaLabel="loading-events"
                  visible={true}
                />
              </div>
            )}

            {isError && (
              <p className="text-error animate-fadeIn">
                {(error as { status?: string })?.status || 'Failed to load events'}
              </p>
            )}

            {!isLoading && hasSearch && filteredEvents.length > 0 && (
              <>
                <p className="text-success mb-2 animate-fadeInUp">
                  Showing {filteredEvents.length} matching upcoming event{filteredEvents.length > 1 ? 's' : ''} for “{search}”.
                </p>
                <Link
                  to="/events"
                  className="btn btn-accent mb-4 animate-fadeInUp"
                >
                  View All Events
                </Link>
              </>
            )}

            {!isLoading && hasSearch && filteredEvents.length === 0 && (
              <p className="text-error animate-fadeInUp">No matching upcoming events found.</p>
            )}

            {!isLoading && filteredEvents.length > 0 && (
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 animate-fadeInUp">
                {filteredEvents.map((evt: any, idx: number) => (
                  <li
                    key={getEventId(evt)}
                    className="bg-base-300/50 px-4 py-2 rounded hover:bg-base-300 transition"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <Link
                      to={`/events/${getEventId(evt)}`}
                      className="flex justify-between items-center group transition duration-300"
                    >
                      <span>{evt.title}</span>
                      <span className="text-xl text-primary transform transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110">
                        →
                      </span>
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
