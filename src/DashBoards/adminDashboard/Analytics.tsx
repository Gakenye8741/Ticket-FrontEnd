import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
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

// Add missing types
interface EventData {
  date: string;
  venue?: { name: string };
}

const cardVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const getMonthlyCounts = (items: { createdAt: string }[]) => {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    counts[monthKey] = (counts[monthKey] || 0) + 1;
  });
  return Object.entries(counts).map(([month, count]) => ({ name: month, value: count }));
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

  const topVenues = Object.entries(venueBookingFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const venuesCount = Object.keys(venueBookingFrequency).length;

  const pieData = [
    { name: 'Users', value: usersCount },
    { name: 'Events', value: eventsCount },
    { name: 'Venues', value: venuesCount },
  ];

  const userMonthlyData = getMonthlyCounts(users);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black py-12 px-4">
      <div className="container mx-auto space-y-12">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {[
            { icon: <FaUsers size={40} />, label: 'Users', count: usersCount, loading: usersLoading },
            { icon: <MdLocationCity size={40} />, label: 'Venues', count: venuesCount, loading: eventsLoading },
            { icon: <GiPartyPopper size={40} />, label: 'Events', count: eventsCount, loading: eventsLoading },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="bg-white/10 backdrop-blur-md text-white p-6 rounded-xl border border-white/20 shadow-lg flex flex-col items-center justify-center text-center"
            >
              {card.loading ? <PuffLoader color="#fff" size={40} /> : (
                <>
                  <div>{card.icon}</div>
                  <h2 className="text-xl font-semibold mt-4 text-white/90">{card.label}</h2>
                  <p className="text-3xl font-bold text-white">{card.count}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <div className="flex-1 bg-white/10 p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-bold text-center text-white mb-4">System Distribution</h2>
            {isChartLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <PuffLoader color="#fff" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* User Line Chart */}
          <div className="flex-1 bg-white/10 p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-bold text-center text-white mb-4">Monthly User Registrations</h2>
            {usersLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <PuffLoader color="#fff" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userMonthlyData}>
                  <XAxis dataKey="name" stroke="#bbb" />
                  <YAxis stroke="#bbb" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', color: '#fff' }} />
                  <Line type="monotone" dataKey="value" stroke="#00C49F" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Venues Bar Chart */}
        <div className="bg-white/10 p-6 rounded-xl border border-white/20">
          <h2 className="text-xl font-bold text-center text-white mb-4">Top 5 Venues by Event Count</h2>
          {eventsLoading ? (
            <div className="flex justify-center items-center h-[250px]">
              <PuffLoader color="#fff" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVenues}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#bbb" />
                <YAxis stroke="#bbb" />
                <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', color: '#fff' }} />
                <Bar dataKey="value" fill="#FF8042" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{ label: 'Events This Week', count: weeklyEvents, color: 'text-amber-300' },
            { label: 'Events This Month', count: monthlyEvents, color: 'text-cyan-300' }].map((card, i) => (
            <div key={i} className="bg-white/10 p-6 rounded-xl text-center border border-white/20 shadow-md">
              <h3 className={`text-xl font-semibold ${card.color}`}>{card.label}</h3>
              <p className={`text-4xl font-bold mt-2 ${card.color}`}>{card.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
