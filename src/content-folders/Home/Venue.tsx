import React from "react";
import { useNavigate } from "react-router-dom";
import { venueApi } from "../../features/APIS/VenueApi";
import { PuffLoader } from "react-spinners";

export const VenueList: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: venues = [],
    isLoading,
    error,
  } = venueApi.useGetAllVenuesQuery({
    pollingInterval: 3000,
  });

  const displayedVenues = venues.slice(0, 3);

  return (
    <section className="min-h-screen py-16 px-6 bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-4xl font-extrabold text-center text-emerald-400 mb-6">
          Top Event Venues in Kenya
        </h2>

        <p className="text-lg text-slate-300 max-w-3xl mx-auto text-center mb-10">
          Discover Kenya’s top venues where magic happens. From iconic stadiums
          to elegant halls, these spaces host unforgettable moments and world-class
          events. Browse our featured venues below.
        </p>

        {/* Data States */}
        {error ? (
          <div className="text-red-400 text-center text-lg font-semibold">
            Failed to load venues. Please try again.
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#34d399" />
          </div>
        ) : displayedVenues.length === 0 ? (
          <div className="text-center text-emerald-200 text-lg">No venues available.</div>
        ) : (
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayedVenues.map((venue: any) => (
              <div
                key={venue.venueId}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl transition-all duration-300 p-6 hover:-translate-y-1 hover:scale-[1.02]"
              >
                {/* Venue Info */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-emerald-300 mb-1">
                    {venue.name}
                  </h3>
                  <p className="text-slate-400 mb-2 line-clamp-2">{venue.address}</p>
                </div>

                <div className="text-sm text-slate-400 mb-4 space-y-1">
                  <p>
                    <span className="text-white font-medium">Capacity:</span>{" "}
                    <span className="text-lime-400">{venue.capacity}</span>
                  </p>
                  <p>
                    <span className="text-white font-medium">Venue ID:</span>{" "}
                    <span className="uppercase tracking-wider text-yellow-300">
                      {venue.venueId}
                    </span>
                  </p>
                </div>

                {/* View Button */}
                <button
                  onClick={() => navigate(`/venues/${venue.venueId}`)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* See More Button */}
        {venues.length > 3 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/venues")}
              className="inline-block px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              See More Venues
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
