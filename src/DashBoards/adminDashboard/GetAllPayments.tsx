import React, { useState } from 'react';
import { paymentApi } from '../../features/APIS/PaymentApi';
import { PuffLoader } from 'react-spinners';
import { useSelector } from 'react-redux';
import type { RootState } from '../../App/store';

const AllPayments: React.FC = () => {
  const { data: payments = [], isLoading, isError, error } = paymentApi.useGetAllPaymentsQuery({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const firstName = useSelector((state: RootState) => state.auth.user?.firstName);

  const filteredPayments = payments.filter(
    (payment: any) =>
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const currentPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen p-6 bg-base-100 text-base-content">
      <div className="mb-6 text-xl sm:text-2xl font-semibold text-primary">
        👋 Hey {firstName}, welcome to Payments Dashboard!
      </div>

      <div className="w-full max-w-6xl mx-auto bg-base-200 rounded-xl border border-base-300 shadow-lg p-6">
        <h2 className="text-3xl font-bold text-primary mb-6">💳 All Payments</h2>

        {/* Search */}
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by Transaction or Booking ID"
            className="input input-bordered w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading and Error */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#22d3ee" />
          </div>
        )}

        {isError && (
          <p className="text-error text-center text-lg font-semibold">
            Error: {(error as any)?.data?.error || 'Something went wrong.'}
          </p>
        )}

        {/* Payments Table */}
        {payments && currentPayments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table table-zebra text-sm">
                <thead>
                  <tr className="text-primary-content bg-primary text-xs uppercase">
                    <th className="px-4 py-2">Transaction ID</th>
                    <th className="px-4 py-2">Booking ID</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPayments.map((payment: any) => (
                    <tr key={payment.paymentId} className="hover:bg-base-300 transition duration-300 ease-in-out">
                      <td className="px-4 py-2">{payment.transactionId}</td>
                      <td className="px-4 py-2">{payment.bookingId}</td>
                      <td className="px-4 py-2">${((Number(payment.amount) || 0) / 100).toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            payment.paymentStatus === 'Completed'
                              ? 'bg-green-600 text-white'
                              : payment.paymentStatus === 'Pending'
                              ? 'bg-yellow-500 text-black'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2">{payment.paymentMethod || 'N/A'}</td>
                      <td className="px-4 py-2">{new Date(payment.paymentDate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          !isLoading && <p className="text-teal-200 text-center">No payments found.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="btn btn-sm btn-secondary"
            >
              Previous
            </button>
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="btn btn-sm btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPayments;
