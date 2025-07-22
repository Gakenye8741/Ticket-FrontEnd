import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { eventApi } from "../../features/APIS/EventsApi";
import { venueApi } from "../../features/APIS/VenueApi";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";

const MySwal = withReactContent(Swal);

// ✅ Add enum values
const eventStatusEnum = ["upcoming", "in_progress", "ended", "cancelled"] as const;
type EventStatus = (typeof eventStatusEnum)[number];

interface VenueData {
  venueId: number;
  name: string;
  capacity: number;
}

interface EventData {
  eventId: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venueId: number;
  ticketPrice: number;
  ticketsTotal: number;
  createdAt: string;
  status: EventStatus; // ✅ Add status
  venue?: VenueData;
}

export const EventDetailsPage = () => {
  const {
    data: allEvents = [],
    isLoading,
    error,
  } = eventApi.useGetAllEventsQuery({
    pollingInterval: 30000,
  });

  const { data: allVenues = [] } = venueApi.useGetAllVenuesQuery({});
  const [createEvent] = eventApi.useCreateEventMutation();
  const [updateEvent] = eventApi.useUpdateEventMutation();
  const [deleteEvent] = eventApi.useDeleteEventMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const categories: string[] = Array.from(
    new Set(allEvents.map((e: EventData) => e.category))
  ).filter((cat): cat is string => typeof cat === "string");

  const filteredEvents = allEvents
    .map((event: EventData) => {
      // Get current date and time
      const now = new Date();
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      
      // Create a new object with updated status (avoiding direct mutation)
      return {
        ...event,
        status: eventDateTime <= now && event.status !== "ended" && event.status !== "cancelled"
          ? "in_progress"
          : event.status,
      };
    })
    .filter((event: EventData) => {
      return (
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter ? event.category === categoryFilter : true) &&
        (dateFilter ? event.date === dateFilter : true)
      );
    });

  const openEventModal = async (initialData?: EventData) => {
    const { value: formValues } = await MySwal.fire({
      title: initialData ? "Edit Event" : "Create Event",
      html: `
        <input id="title" class="swal2-input" placeholder="Title" value="${initialData?.title ?? ""}">
        <input id="description" class="swal2-input" placeholder="Description" value="${initialData?.description ?? ""}">
        <input id="category" class="swal2-input" placeholder="Category" value="${initialData?.category ?? ""}">
        <input id="date" class="swal2-input" type="date" value="${initialData?.date ?? ""}">
        <input id="time" class="swal2-input" type="time" value="${initialData?.time ?? ""}">
        <input id="ticketPrice" class="swal2-input" type="number" placeholder="Ticket Price" value="${initialData?.ticketPrice ?? ""}">
        <input id="ticketsTotal" class="swal2-input" type="number" placeholder="Tickets Total" value="${initialData?.ticketsTotal ?? ""}">
        <select id="venueId" class="swal2-input">
          ${allVenues
            .map(
              (v: VenueData) =>
                `<option value="${v.venueId}" ${initialData?.venueId === v.venueId ? "selected" : ""}>${v.name}</option>`
            )
            .join("")}
        </select>
        <select id="status" class="swal2-input">
          ${eventStatusEnum
            .map(
              (status) =>
                `<option value="${status}" ${initialData?.status === status ? "selected" : ""}>${status.replace("_", " ")}</option>`
            )
            .join("")}
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: initialData ? "Update" : "Create",
      width: "650px",
      customClass: { popup: "glass-modal" },
      preConfirm: () => {
        const title = (document.getElementById("title") as HTMLInputElement).value.trim();
        const description = (document.getElementById("description") as HTMLInputElement).value.trim();
        const category = (document.getElementById("category") as HTMLInputElement).value.trim();
        const date = (document.getElementById("date") as HTMLInputElement).value;
        const time = (document.getElementById("time") as HTMLInputElement).value;
        const ticketPrice = Number((document.getElementById("ticketPrice") as HTMLInputElement).value);
        const ticketsTotal = Number((document.getElementById("ticketsTotal") as HTMLInputElement).value);
        const venueId = Number((document.getElementById("venueId") as HTMLSelectElement).value);
        const status = (document.getElementById("status") as HTMLSelectElement).value as EventStatus;

        if (!title || !venueId || !date || !time || !ticketPrice || !ticketsTotal || !status) {
          Swal.showValidationMessage("⚠️ Essential fields are required");
          return;
        }

        return {
          eventId: initialData?.eventId,
          title,
          description,
          category,
          date,
          time,
          ticketPrice,
          ticketsTotal,
          venueId,
          status, // ✅ Include status
        };
      },
    });

    if (formValues) {
      const conflict = allEvents.find(
        (ev: EventData) =>
          ev.venueId === formValues.venueId &&
          ev.date === formValues.date &&
          ev.eventId !== formValues.eventId
      );

      if (conflict) {
        MySwal.fire("Conflict", "Another event is already scheduled at this venue on this date.", "error");
        return;
      }

      try {
        initialData
          ? await updateEvent(formValues).unwrap()
          : await createEvent(formValues).unwrap();

        MySwal.fire("Success", `Event ${initialData ? "updated" : "created"} successfully.`, "success");
      } catch {
        MySwal.fire("Error", "Something went wrong while saving event.", "error");
      }
    }
  };

  const handleDelete = async (eventId: number) => {
    const confirm = await MySwal.fire({
      title: "Are you sure?",
      text: "This event will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "glass-modal" },
    });

    if (confirm.isConfirmed) {
      try {
        await deleteEvent(eventId).unwrap();
        MySwal.fire("Deleted!", "Event has been removed.", "success");
      } catch {
        MySwal.fire("Error!", "Failed to delete event.", "error");
      }
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const colorMap: Record<EventStatus, string> = {
      upcoming: "bg-blue-500",
      in_progress: "bg-yellow-500",
      ended: "bg-gray-500",
      cancelled: "bg-red-500",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded text-white ${colorMap[status]}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1950&h=1300&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative z-10 max-w-7xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-teal-400">All Events</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search title"
              className="px-4 py-2 w-full sm:w-40 rounded-md bg-slate-700 text-white placeholder-white/70"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded bg-slate-700 text-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded bg-slate-700 text-white"
            />
            <button
              onClick={() => openEventModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              ➕ Add Event
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-red-400 text-center">Error loading events.</div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#14b8a6" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center text-cyan-200">No events match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white">
              <thead>
                <tr className="bg-white/10 text-teal-300 uppercase text-xs">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Venue</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Tickets</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event: EventData) => (
                  <tr key={event.eventId} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-4 py-2">{event.title}</td>
                    <td className="px-4 py-2">{event.category}</td>
                    <td className="px-4 py-2">{event.date}</td>
                    <td className="px-4 py-2">{event.time}</td>
                    <td className="px-4 py-2">{event.venue?.name ?? "Unknown"}</td>
                    <td className="px-4 py-2">${Number(event.ticketPrice).toFixed(2)}</td>
                    <td className="px-4 py-2">{event.ticketsTotal}</td>
                    <td className="px-4 py-2">{getStatusBadge(event.status)}</td>
                    <td className="px-4 py-2">{new Date(event.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => openEventModal(event)}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-white text-xs"
                      >
                        <FaEdit/>
                      </button>
                      <button
                        onClick={() => handleDelete(event.eventId)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs"
                      >
                        <FaDeleteLeft/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
