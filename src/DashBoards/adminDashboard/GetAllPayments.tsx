import React, { useState, useMemo } from 'react';
import { paymentApi } from '../../features/APIS/PaymentApi';
import { bookingApi } from '../../features/APIS/BookingsApi';
import { eventApi } from '../../features/APIS/EventsApi';
import { ticketApi } from '../../features/APIS/ticketsType.Api';
import { PuffLoader } from 'react-spinners';
import { saveAs } from 'file-saver';

const AllPayments: React.FC = () => {
  const { data: payments = [], isLoading: paymentsLoading } = paymentApi.useGetAllPaymentsQuery({});
  const { data: bookings = [] } = bookingApi.useGetAllBookingsQuery();
  const { data: events = [] } = eventApi.useGetAllEventsQuery({});
  const { data: ticketTypes = [] } = ticketApi.useGetAllTicketTypesQuery({});

  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Enrich payment data
  const enriched = useMemo(() => {
    return payments.map((p: any) => {
      const b = bookings.find((x: any) => x.bookingId === p.bookingId);
      const ev = events.find((e: any) => b?.eventId === e.eventId);
      const t = ticketTypes.find((t: any) => b?.ticketTypeId === t.ticketTypeId);
      return {
        ...p,
        eventName: ev?.title ?? 'N/A',
        ticketTypeName: t?.name ?? 'N/A',
      };
    });
  }, [payments, bookings, events, ticketTypes]);

  // Apply filters
  const filtered = useMemo(() => {
    return enriched.filter((p: any) => {
      const pd = new Date(p.paymentDate);
      if (statusFilter && p.paymentStatus !== statusFilter) return false;
      if (methodFilter && p.paymentMethod !== methodFilter) return false;
      if (dateFrom && pd < new Date(dateFrom)) return false;
      if (dateTo && pd > new Date(dateTo)) return false;
      return true;
    });
  }, [enriched, statusFilter, methodFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalRevenue = filtered.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const totalRevenueKES = (totalRevenue / 100).toFixed(2);

  const exportCSV = () => {
    const header = ['Txn ID','Booking ID','Event','Ticket Type','Amount (KES)','Status','Method','Date'];
    const rows = filtered.map((p: any) => [
      p.transactionId, p.bookingId, p.eventName, p.ticketTypeName,
      (p.amount/100).toFixed(2), p.paymentStatus, p.paymentMethod, new Date(p.paymentDate).toLocaleString()
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'payments.csv');
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-base-100 text-base-content">
      <h1 className="text-2xl font-bold">💳 Payments Analytics</h1>

      {paymentsLoading ? (
        <div className="flex justify-center"><PuffLoader /></div>
      ) : (
        <>
          {/* Total Revenue */}
          <div className="bg-base-200 text-base-content p-4 rounded shadow border border-base-300">
            <h2 className="text-lg font-semibold">Total Revenue</h2>
            <p className="text-3xl font-bold">KES {totalRevenueKES}</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block mb-1">Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select select-bordered">
                <option value="">All</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Method:</label>
              <input
                type="text"
                placeholder="e.g. Mpesa"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="input input-bordered"
              />
            </div>

            <div>
              <label className="block mb-1">From:</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input input-bordered" />
            </div>
            <div>
              <label className="block mb-1">To:</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input input-bordered" />
            </div>

            <button onClick={exportCSV} className="btn btn-primary mt-4">Export CSV</button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-300 text-base-content">
                  <th>Txn ID</th>
                  <th>Booking ID</th>
                  <th>Event</th>
                  <th>Ticket Type</th>
                  <th>Amount (KES)</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p: any) => (
                  <tr key={p.paymentId}>
                    <td>{p.transactionId}</td>
                    <td>{p.bookingId}</td>
                    <td>{p.eventName}</td>
                    <td>{p.ticketTypeName}</td>
                    <td>{(p.amount / 100).toFixed(2)}</td>
                    <td>{p.paymentStatus}</td>
                    <td>{p.paymentMethod}</td>
                    <td>{new Date(p.paymentDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="btn btn-sm btn-outline"
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="btn btn-sm btn-outline"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllPayments;
