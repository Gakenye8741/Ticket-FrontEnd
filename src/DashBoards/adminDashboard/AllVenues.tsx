import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { venueApi } from "../../features/APIS/VenueApi";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";

const MySwal = withReactContent(Swal);

interface VenueData {
  venueId: number;
  name: string;
  address: string;
  capacity: number;
  status: "available" | "booked";
  createdAt: string;
}

export const AllVenues = () => {
  const {
    data: allVenues = [],
    isLoading,
    error,
    refetch,
  } = venueApi.useGetAllVenuesQuery(undefined, {
    pollingInterval: 60_000,
    refetchOnMountOrArgChange: true,
  });

  const [createVenue] = venueApi.useCreateVenueMutation();
  const [updateVenue] = venueApi.useUpdateVenueMutation();
  const [deleteVenue] = venueApi.useDeleteVenueMutation();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredVenues = allVenues.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toBackendPayload = (data: Partial<VenueData>) => {
    const { status, ...rest } = data;
    return { ...rest, status };
  };

  const openVenueModal = async (initial?: VenueData) => {
    const { value } = await MySwal.fire({
      title: initial ? "Edit Venue" : "Add New Venue",
      html: `
        <input id="venue-name" class="swal2-input" placeholder="Venue Name" value="${
          initial?.name ?? ""
        }" />
        <input id="venue-address" class="swal2-input" placeholder="Address" value="${
          initial?.address ?? ""
        }" />
        <input id="venue-capacity" class="swal2-input" type="number" placeholder="Capacity" value="${
          initial?.capacity ?? ""
        }" />
        <select id="venue-status" class="swal2-input">
          <option value="available" ${
            initial?.status === "available" ? "selected" : ""
          }>✅ Available</option>
          <option value="booked" ${
            initial?.status === "booked" ? "selected" : ""
          }>📌 Booked</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: initial ? "Update" : "Create",
      width: "600px",
      customClass: { popup: "glass-modal" },
      preConfirm: () => {
        const name = (document.getElementById("venue-name") as HTMLInputElement).value.trim();
        const address = (document.getElementById("venue-address") as HTMLInputElement).value.trim();
        const capacity = Number(
          (document.getElementById("venue-capacity") as HTMLInputElement).value
        );
        const status = (
          (document.getElementById("venue-status") as HTMLSelectElement).value || "available"
        ) as "available" | "booked";

        if (!name || !address || !capacity) {
          Swal.showValidationMessage("All fields are required.");
          return;
        }

        const payload: Partial<VenueData> = {
          name,
          address,
          capacity,
          status,
        };
        if (initial) payload.venueId = initial.venueId;
        return payload;
      },
    });

    if (!value) return;

    try {
      if (value.venueId) {
        await updateVenue(toBackendPayload(value)).unwrap();
        MySwal.fire("Updated!", "Venue updated successfully.", "success");
      } else {
        await createVenue(toBackendPayload(value)).unwrap();
        MySwal.fire("Created!", "Venue created successfully.", "success");
      }
      refetch();
    } catch (err: any) {
      MySwal.fire("Error", err?.data?.message || "Failed to save venue.", "error");
    }
  };

  const handleStatusChange = async (
    venue: VenueData,
    newStatus: "available" | "booked"
  ) => {
    if (venue.status === newStatus) return;

    const patch = venueApi.util.updateQueryData(
      "getAllVenues",
      undefined,
      (draft) => {
        const v = draft.find((v) => v.venueId === venue.venueId);
        if (v) v.status = newStatus;
      }
    );

    try {
      await updateVenue(
        toBackendPayload({ venueId: venue.venueId, status: newStatus })
      ).unwrap();
      refetch();
    } catch (err: any) {
      patch.undo();
      MySwal.fire("Error", err?.data?.message || "Failed to update status.", "error");
    }
  };

  const handleDelete = async (venueId: number) => {
    const c = await MySwal.fire({
      title: "Are you sure?",
      text: "This venue will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "glass-modal" },
    });

    if (!c.isConfirmed) return;

    try {
      await deleteVenue(venueId).unwrap();
      MySwal.fire("Deleted!", "Venue has been removed.", "success");
      refetch();
    } catch (err: any) {
      MySwal.fire("Error!", err?.data?.message || "Failed to delete venue.", "error");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1950&q=80')",
      }}
    >
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-orange-400">All Venues</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by venue name"
              className="px-4 py-2 w-full sm:w-64 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring focus:ring-cyan-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => openVenueModal()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              ➕ Add Venue
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-red-400 text-center text-lg font-semibold">
            Something went wrong. Please try again.
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#22d3ee" />
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center text-cyan-200 text-lg">No venues found.</div>
        ) : (
          <table className="min-w-full text-sm text-white">
            <thead>
              <tr className="bg-white/20 text-orange-300 uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Capacity</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVenues.map((venue) => (
                <tr
                  key={venue.venueId}
                  className="hover:bg-white/10 border-b border-white/10"
                >
                  <td className="px-4 py-2">{venue.name}</td>
                  <td className="px-4 py-2">{venue.address}</td>
                  <td className="px-4 py-2">{venue.capacity}</td>
                  <td className="px-4 py-2">
                    <select
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        venue.status === "available"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                      value={venue.status}
                      onChange={(e) =>
                        handleStatusChange(venue, e.target.value as "available" | "booked")
                      }
                    >
                      <option value="available">✅ Available</option>
                      <option value="booked">📌 Booked</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(venue.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => openVenueModal(venue)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs"
                    >
                      <FaEdit/>
                    </button>
                    <button
                      onClick={() => handleDelete(venue.venueId)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs"
                    >
                      <FaDeleteLeft/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
