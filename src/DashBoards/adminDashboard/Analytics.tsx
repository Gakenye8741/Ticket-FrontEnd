import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { FaUsers } from 'react-icons/fa';
import { GiPartyPopper } from 'react-icons/gi';
import { MdLocationCity } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { PuffLoader } from 'react-spinners';
import { userApi } from '../../features/APIS/UserApi';
import { eventApi } from '../../features/APIS/EventsApi';
import type { RootState } from '../../App/store';

interface EventData {
  date: string;
  venue?: { name: string };
  category?: string;
  attendance?: number;
}

const cardVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6699', '#33CCFF'];

const getMonthlyCounts = (items: { createdAt: string }[]) => {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    counts[monthKey] = (counts[monthKey] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getDailyCounts = (items: { createdAt: string }[], days = 7) => {
  const counts: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    counts[dayKey] = 0;
  }
  items.forEach((item) => {
    const dayKey = item.createdAt.slice(0, 10);
    if (dayKey in counts) counts[dayKey]++;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getYearlyCounts = (items: { createdAt: string }[]) => {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const year = new Date(item.createdAt).getFullYear();
    counts[year] = (counts[year] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const isWithinRange = (dateStr: string, start: Date, end: Date): boolean => {
  const date = new Date(dateStr);
  return date >= start && date <= end;
};

export const Analytics = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: users = [], isLoading: usersLoading } = userApi.useGetAllUsersProfilesQuery({ skip: !isAuthenticated });
  const { data: events = [], isLoading: eventsLoading } = eventApi.useGetAllEventsQuery({ skip: !isAuthenticated });

  const isChartLoading = usersLoading || eventsLoading;

  const usersCount = users.length;
  const eventsCount = events.length;

  const venueBookingFrequency: Record<string, number> = {};
  events.forEach((event: EventData) => {
    const venueName = event.venue?.name || 'Unknown Venue';
    venueBookingFrequency[venueName] = (venueBookingFrequency[venueName] || 0) + 1;
  });
  const venuesCount = Object.keys(venueBookingFrequency).length;
  const averageBookingsPerVenue = venuesCount > 0 ? (eventsCount / venuesCount).toFixed(2) : '0';

  const topVenues = Object.entries(venueBookingFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const eventTypeFrequency: Record<string, number> = {};
  events.forEach((event: EventData) => {
    const type = event.category || 'Unknown';
    eventTypeFrequency[type] = (eventTypeFrequency[type] || 0) + 1;
  });
  const popularEventTypes = Object.entries(eventTypeFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalAttendance = events.reduce((sum:number, ev:any) => sum + (ev.attendance || 0), 0);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const weeklyEvents = events.filter((event: EventData) =>
    isWithinRange(event.date, startOfWeek, endOfWeek)
  ).length;

  const monthlyEvents = events.filter((event: EventData) =>
    isWithinRange(event.date, startOfMonth, endOfMonth)
  ).length;

  const userMonthlyData = getMonthlyCounts(users);
  const userDailyData = getDailyCounts(users, 7);
  const userYearlyData = getYearlyCounts(users);

  const pieData = [
    { name: 'Users', value: usersCount },
    { name: 'Events', value: eventsCount },
    { name: 'Venues', value: venuesCount },
  ];

  return (
    <div className="min-h-screen bg-base-200/90 py-12 px-6">
      <div className="container mx-auto space-y-12">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {[{ icon: <FaUsers size={40} />, label: 'Users', count: usersCount, loading: usersLoading },
            { icon: <MdLocationCity size={40} />, label: 'Venues', count: venuesCount, loading: eventsLoading },
            { icon: <GiPartyPopper size={40} />, label: 'Events', count: eventsCount, loading: eventsLoading },
            { icon: <MdLocationCity size={40} />, label: 'Avg Bookings per Venue', count: averageBookingsPerVenue, loading: false },
            { icon: <GiPartyPopper size={40} />, label: 'Events This Week', count: weeklyEvents, loading: eventsLoading },
            { icon: <GiPartyPopper size={40} />, label: 'Events This Month', count: monthlyEvents, loading: eventsLoading },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="bg-base-300/70 text-base-content p-6 rounded-xl border border-base-content/20 shadow-md flex flex-col items-center justify-center text-center"
            >
              {card.loading ? <PuffLoader color="var(--pf)" size={40} /> : (
                <>
                  <div className="mb-3">{card.icon}</div>
                  <h2 className="text-xl font-semibold text-primary">{card.label}</h2>
                  <p className="text-3xl font-extrabold">{card.count}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* System Distribution Pie Chart */}
          <div className="flex-1 bg-base-300/70 p-6 rounded-xl border border-base-content/20 shadow-md">
            <h2 className="text-xl font-bold text-center text-primary mb-4">System Distribution</h2>
            {isChartLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <PuffLoader color="var(--pf)" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--pfc)',
                      border: 'none',
                      color: 'var(--pf)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly User Registrations LineChart */}
          <div className="flex-1 bg-base-300/70 p-6 rounded-xl border border-base-content/20 shadow-md">
            <h2 className="text-xl font-bold text-center text-primary mb-4">Monthly User Registrations</h2>
            {usersLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <PuffLoader color="var(--pf)" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userMonthlyData} style={{ backgroundColor: 'var(--pf-bg)', borderRadius: 12 }}>
                  <XAxis stroke="var(--pf)" dataKey="name" />
                  <YAxis stroke="var(--pf)" />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--pfc)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--pfc)',
                      border: 'none',
                      color: 'var(--pf)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e" // green-500
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* More Time-based User Trends */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Daily User Registrations (Last 7 days) */}
          <div className="flex-1 bg-base-300/70 p-6 rounded-xl border border-base-content/20 shadow-md">
            <h2 className="text-xl font-bold text-center text-primary mb-4">Daily User Registrations (Last 7 Days)</h2>
            {usersLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <PuffLoader color="var(--pf)" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userDailyData} style={{ backgroundColor: 'var(--pf-bg)', borderRadius: 12 }}>
                  <XAxis stroke="var(--pf)" dataKey="name" />
                  <YAxis stroke="var(--pf)" />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--pfc)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--pfc)',
                      border: 'none',
                      color: 'var(--pf)',
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} /> {/* blue-500 */}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Yearly User Registrations */}
          <div className="flex-1 bg-base-300/70 p-6 rounded-xl border border-base-content/20 shadow-md">
            <h2 className="text-xl font-bold text-center text-primary mb-4">Yearly User Registrations</h2>
            {usersLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <PuffLoader color="var(--pf)" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userYearlyData} style={{ backgroundColor: 'var(--pf-bg)', borderRadius: 12 }}>
                  <XAxis stroke="var(--pf)" dataKey="name" />
                  <YAxis stroke="var(--pf)" />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--pfc)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--pfc)',
                      border: 'none',
                      color: 'var(--pf)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b" // amber-500
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Venues Bar Chart */}
        <div className="bg-base-300/70 p-6 rounded-xl border border-base-content/20 shadow-md">
          <h2 className="text-xl font-bold text-center text-primary mb-4">Top Venues by Bookings</h2>
          {eventsLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <PuffLoader color="var(--pf)" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVenues}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--pfc)" />
                <XAxis dataKey="name" stroke="var(--pf)" />
                <YAxis stroke="var(--pf)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--pfc)',
                    border: 'none',
                    color: 'var(--pf)',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} /> {/* violet-500 */}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Popular Event Types PieChart */}
        <div className="bg-base-300/70 p-6 rounded-xl border border-base-content/20 shadow-md">
          <h2 className="text-xl font-bold text-center text-primary mb-4">Popular Event Types</h2>
          {eventsLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <PuffLoader color="var(--pf)" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={popularEventTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {popularEventTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--pfc)',
                    border: 'none',
                    color: 'var(--pf)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Total Attendance */}
        <div className="bg-base-300/70 p-6 rounded-xl border border-base-content/20 shadow-md text-center">
          <h2 className="text-xl font-bold text-primary mb-2">Total Attendance</h2>
          <p className="text-4xl font-extrabold">{totalAttendance}</p>
        </div>

      </div>
    </div>
  );
};
