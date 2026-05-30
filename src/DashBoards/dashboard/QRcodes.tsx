import React from 'react';
import { useSelector } from 'react-redux';
import { useGetMobileWalletQuery } from '../../features/APIS/QrcodeTicketApi';
import QrCodes from '../../components/Qrcodes';
import { eventApi } from '../../features/APIS/EventsApi';
import { PuffLoader } from 'react-spinners';

interface RootState {
  auth: {
    user: { nationalId: number } | null;
  };
}

const MyWalletPage: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);

  const { data: walletData, isLoading, isFetching, error } = useGetMobileWalletQuery(
    nationalId as number, 
    { skip: !nationalId }
  );

  const { data: allEvents = [] } = eventApi.useGetAllEventsQuery({});

  const passes = walletData?.passes || [];

  if (!nationalId) return <div className="text-center p-10 font-medium">Please log in to view your tickets.</div>;
  
  if (isLoading || isFetching) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <PuffLoader color="oklch(var(--p))" />
      <p className="font-medium opacity-60">Loading your tickets...</p>
    </div>
  );

  if (error) return <div className="text-error p-10 text-center font-medium">Unable to load your wallet. Please try again later.</div>;

  return (
    <div className="min-h-screen bg-base-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="text-base-content/60 mt-1">View and manage your active event passes below.</p>
        </header>
        
        {passes.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-base-content/10 rounded-3xl">
            <p className="text-base-content/50">You don't have any tickets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passes.map((pass: any) => {
              const event = allEvents.find((e: any) => e.eventId === pass.eventId);
              const eventName = event ? event.title : "Event Details Unavailable";

              return (
                <QrCodes 
                  key={pass.ticketToken} 
                  qrPass={{ 
                    ...pass, 
                    eventName 
                  }} 
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWalletPage;