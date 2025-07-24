import { NavLink } from "react-router-dom";
import {
  TrendingUp,
  Users,
  ClipboardList,
  User,
  LogOut,
  DollarSign,
  Ticket,
  Camera,
  Calendar,
  FileText,
  House,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../features/Auth/AuthSlice";

const navItems = [
  { name: "Analytics", path: "analytics", icon: <TrendingUp className="text-indigo-400" /> },
  { name: "Manage Users", path: "AllUsers", icon: <Users className="text-blue-400" /> },
  { name: "Manage Bookings", path: "AllBookings", icon: <ClipboardList className="text-crimson-400" /> },
  { name: "Manage Venues", path: "Allvenues", icon: <House className="text-green-400" /> },
  { name: "Manage Medias", path: "AllMedia", icon: <Camera className="text-yellow-400" /> }, // Media icon
  { name: "Manage Events", path: "AllEvents", icon: <Calendar className="text-orange-400" /> }, // Event icon
  { name: "Manage Payments", path: "AllPayments", icon: <DollarSign className="text-yellow-900" /> },
  { name: "Manage Support Tickets", path: "supportTickets", icon: <Ticket className="text-purple-400" /> },
  { name: "Manage Ticket Types", path: "ticketTypes", icon: <FileText className="text-teal-400" /> }, // File/Text icon
  { name: "My Profile", path: "adminprofile", icon: <User className="text-purple-400" /> },
  { name: "Logout", path: "#", icon: <LogOut className="text-red-500" /> },
];

export const AdminSideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(clearCredentials());
    onNavItemClick?.(); // Close drawer on mobile
  };

  return (
    <aside className="h-full w-full p-4 bg-gray-900 text-white space-y-2 overflow-y-auto mt-15">

     <h4 className="mt-1 flex items-center justify-center text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-yellow-500">
      <span className="mr-5 ">🛠️</span> {/* Tool Emoji */}
      Admin Side NavBar
      <span className="ml-2">👑</span> {/* Crown Emoji */}
    </h4>
      {navItems.map((item, index) =>
        item.name === "Logout" ? (
          <button
            key={index}
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition"
            aria-label="Logout"
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ) : (
          <NavLink
            key={index}
            to={item.path}
            onClick={onNavItemClick}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition"
            aria-label={`Go to ${item.name}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        )
      )}
    </aside>
  );
};
