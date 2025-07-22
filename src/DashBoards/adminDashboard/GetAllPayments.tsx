import React from 'react';
import { paymentApi } from '../../features/APIS/PaymentApi';

const AllPayments: React.FC = () => {
  const { data: payments, isLoading, isError, error } = paymentApi.useGetAllPaymentsQuery({});

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1581090700227-1e8eec6c9b3d?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Overlay for glassmorphism */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-xl p-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-teal-300 mb-6">
            💳 All Payments
          </h2>

          {/* Loading and Error Handling */}
          {isLoading && <p className="text-teal-200 animate-pulse">Loading payments...</p>}

          {isError && (
            <p className="text-red-400">
              Error: {(error as any)?.data?.error || 'Something went wrong.'}
            </p>
          )}

          {/* Payments Table */}
          {payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-white transition-opacity duration-500 ease-in">
                <thead>
                  <tr className="bg-white/10 text-teal-300 uppercase text-xs">
                    <th className="px-4 py-2 text-left">Transaction ID</th>
                    <th className="px-4 py-2 text-left">Booking ID</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Method</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr
                      key={payment.paymentId}
                      className="border-b border-white/10 hover:bg-white/5 transition duration-300 ease-in-out"
                    >
                      <td className="px-4 py-2">{payment.transactionId}</td>
                      <td className="px-4 py-2">{payment.bookingId}</td>
                      <td className="px-4 py-2">
                        ${((Number(payment.amount) || 0) / 100).toFixed(2)}
                      </td>
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
                      <td className="px-4 py-2">
                        {new Date(payment.paymentDate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !isLoading && <p className="text-teal-200">No payments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPayments;
