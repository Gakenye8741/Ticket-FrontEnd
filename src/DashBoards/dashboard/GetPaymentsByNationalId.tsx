import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { paymentApi } from '../../features/APIS/PaymentApi';
import type { RootState } from '../../App/store';

const GetPaymentsByNationalId: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const {
    data: payments,
    isLoading,
    isError,
    error,
  } = paymentApi.useGetPaymentsByNationalIdQuery(nationalId, {
    skip: !nationalId,
  });

  const handleDownloadTicket = async (payment: any) => {
    const elementId = `ticket-${payment.paymentId}`;
    const ticketElement = document.getElementById(elementId);
    if (!ticketElement) {
      alert('Ticket content not found.');
      return;
    }

    setLoadingId(payment.paymentId);

    try {
      ticketElement.style.opacity = '1';
      ticketElement.style.position = 'absolute';
      ticketElement.style.left = '-9999px';
      ticketElement.style.top = '0';
      ticketElement.style.zIndex = '9999';

      await new Promise((res) => setTimeout(res, 400));

      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, imgHeight);
      pdf.save(`Ticket_${payment.transactionId}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('❌ Failed to generate PDF. Try again.');
    } finally {
      setLoadingId(null);
      ticketElement.style.opacity = '0';
      ticketElement.style.position = 'fixed';
      ticketElement.style.zIndex = '-1';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6 rounded-2xl shadow-lg backdrop-blur-md bg-red-100 border border-white/20 overflow-x-auto mt-16"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">💳 My Payments</h2>

      {isLoading && <p className="text-slate-700">Loading your payments...</p>}
      {isError && <p className="text-red-600">Error: {(error as any)?.data?.error || 'Something went wrong.'}</p>}

      {payments && payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 border-separate border-spacing-y-2">
            <thead className="text-xs uppercase bg-white/50 text-slate-800 font-semibold">
              <tr>
                <th className="px-4 py-2">Transaction ID</th>
                <th className="px-4 py-2">Booking ID</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment: any) => (
                <React.Fragment key={payment.paymentId}>
                  <motion.tr
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-white/60 backdrop-blur-md hover:bg-white/80 transition-all duration-200 rounded-xl shadow-sm"
                  >
                    <td className="px-4 py-3 rounded-l-xl">{payment.transactionId || 'N/A'}</td>
                    <td className="px-4 py-3">{payment.bookingId}</td>
                    <td className="px-4 py-3">${(payment.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.paymentStatus === 'PAID'
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
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(payment.paymentDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 rounded-r-xl">
                      <button
                        onClick={() => handleDownloadTicket(payment)}
                        disabled={loadingId === payment.paymentId}
                        className="px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 transition disabled:opacity-50"
                      >
                        {loadingId === payment.paymentId ? '⏳ Generating...' : 'Download'}
                      </button>
                    </td>
                  </motion.tr>

                  {/* Hidden offscreen ticket */}
                  <div
                    id={`ticket-${payment.paymentId}`}
                    className="fixed top-0 left-[-9999px] opacity-0 z-[-1] bg-white text-black p-6 w-[500px] rounded shadow"
                  >
                    {/* 🎨 Ticket Branding */}
                    <div className="flex flex-col items-center mb-4">
                      <img
                        src="/logo192.png"
                        alt="Ticket Logo"
                        className="w-16 h-16 mb-2"
                      />
                      <h3 className="text-xl font-bold">Event Ticket</h3>
                      <p className="text-sm text-gray-600">Issued by Your Company</p>
                    </div>
                    <hr className="my-2" />

                    <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
                    <p><strong>Booking ID:</strong> {payment.bookingId}</p>
                    <p><strong>Amount:</strong> ${(payment.amount / 100).toFixed(2)}</p>
                    <p><strong>Status:</strong> {payment.paymentStatus}</p>
                    <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
                    <p><strong>Date:</strong> {new Date(payment.paymentDate).toLocaleString()}</p>
                    <hr className="my-2" />
                    <p className="text-center text-xs text-gray-500 mt-2">🎉 Thank you for your purchase!</p>
                  </div>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && <p className="text-slate-600 text-center">You have no payments on record.</p>
      )}
    </motion.div>
  );
};

export default GetPaymentsByNationalId;
