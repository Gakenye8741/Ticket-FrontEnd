import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { paymentApi } from '../../features/APIS/PaymentApi';
import { eventApi } from '../../features/APIS/EventsApi'; // ✅ Added Event API import
import type { RootState } from '../../App/store';

const GetPaymentsByNationalId: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);
  const firstName = useSelector((state: RootState) => state.auth.user?.firstName);

  // 📥 Fetch Payments
  const {
    data: payments,
    isLoading,
    isError,
    error,
  } = paymentApi.useGetPaymentsByNationalIdQuery(nationalId, {
    skip: !nationalId,
  });

  // 📥 Fetch Events to map IDs to Names
  const { data: allEvents } = eventApi.useGetAllEventsQuery(undefined);

  // 🧠 Create an Event Name Lookup Map
  const eventMap = useMemo(() => {
    if (!allEvents) return {};
    return allEvents.reduce((acc: any, event: any) => {
      acc[event.eventId] = event.title;
      return acc;
    }, {});
  }, [allEvents]);

  // 📊 Analytics Calculations (Today, Week, Month, Year)
  const stats = useMemo(() => {
    if (!payments) return { today: 0, week: 0, month: 0, year: 0 };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const curr = new Date();
    const first = curr.getDate() - curr.getDay();
    const startOfWeek = new Date(curr.setDate(first)).setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    return payments.reduce((acc: any, p: any) => {
      const pDate = new Date(p.paymentDate).getTime();
      const pAmount = parseFloat(p.amount);

      if (p.paymentStatus === 'Completed' || p.paymentStatus === 'PAID') {
        if (pDate >= startOfToday) acc.today += pAmount;
        if (pDate >= startOfWeek) acc.week += pAmount;
        if (pDate >= startOfMonth) acc.month += pAmount;
        if (pDate >= startOfYear) acc.year += pAmount;
      }
      return acc;
    }, { today: 0, week: 0, month: 0, year: 0 });
  }, [payments]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<string>('All');

  const paymentsPerPage = 10;

  // ✅ Filter payments by "Completed" or "Pending"
  const filteredPayments = payments
    ? payments.filter((p: any) => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Completed') return p.paymentStatus === 'Completed';
        if (statusFilter === 'Pending') return p.paymentStatus === 'Pending';
        return false;
      })
    : [];

  // ✅ Sort from latest to oldest
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  // ✅ Paginate
  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = sortedPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen mt-20 px-4"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 p-1 rounded-2xl shadow-xl mb-20">
        <div className="rounded-2xl bg-base-100 p-6">
          <h2 className="text-2xl font-semibold text-primary mb-2 text-center">
            👋 Hey {firstName || 'there'}, welcome back!
          </h2>
          <h2 className="text-3xl font-bold mb-4 text-primary text-center">💳 My Payments</h2>

          {/* 📊 Analytics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Today', amount: stats.today, color: 'text-blue-600' },
              { label: 'This Week', amount: stats.week, color: 'text-purple-600' },
              { label: 'This Month', amount: stats.month, color: 'text-indigo-600' },
              { label: 'This Year', amount: stats.year, color: 'text-primary' },
            ].map((item, idx) => (
              <div key={idx} className="bg-base-200 p-4 rounded-xl border border-base-300 shadow-sm text-center">
                <p className="text-[10px] uppercase font-black opacity-50 mb-1">{item.label}</p>
                <p className={`text-xl font-black ${item.color}`}>
                  {item.amount.toLocaleString()} <span className="text-[10px]">KSH</span>
                </p>
              </div>
            ))}
          </div>

          {/* ✅ Filter Dropdown */}
          <div className="flex justify-center mb-6">
            <select
              className="select select-bordered max-w-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {isLoading && <p className="text-center text-base-content">Loading your payments...</p>}
          {isError && (
            <p className="text-center text-error">
              Error: {(error as any)?.data?.error || 'Something went wrong.'}
            </p>
          )}

          {payments && sortedPayments.length > 0 ? (
            <div className="overflow-x-auto animate-fadeIn">
              <table className="min-w-full text-sm text-left text-base-content border-separate border-spacing-y-2">
                <thead className="text-xs uppercase bg-base-200 text-primary font-semibold">
                  <tr>
                    <th className="px-4 py-2">Transaction ID</th>
                    <th className="px-4 py-2">Event Name</th> {/* ✅ NEW HEADER */}
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPayments.map((payment: any) => (
                    <motion.tr
                      key={payment.paymentId}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-base-100 hover:bg-base-200 transition duration-200 shadow rounded-xl"
                    >
                      <td className="px-4 py-3 rounded-l-xl font-mono text-xs opacity-70">
                        {payment.transactionId || 'N/A'}
                      </td>
                      
                      {/* ✅ Logic: Look up event title by ID from the Map */}
                      <td className="px-4 py-3 font-bold text-secondary">
                        {eventMap[payment.booking?.eventId] || `Event #${payment.booking?.eventId}`}
                      </td>

                      <td className="px-4 py-3 font-medium text-lg">
                        KSH {Number(payment.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.paymentStatus === 'Completed' || payment.paymentStatus === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : payment.paymentStatus === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">{payment.paymentMethod || 'N/A'}</td>
                      <td className="px-4 py-3 rounded-r-xl">
                        {new Date(payment.paymentDate).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* ✅ Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn btn-sm ${currentPage === i + 1 ? 'btn-active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isLoading && (
              <p className="text-center text-slate-500 mt-4">
                No payments found for selected status.
              </p>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GetPaymentsByNationalId;