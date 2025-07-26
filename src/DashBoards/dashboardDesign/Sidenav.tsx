import { User, LogOut, CreditCard, Ticket } from "lucide-react";

import { RiShoppingCart2Line } from "react-icons/ri";
import { Link } from "react-router-dom";

export const SideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  return (
    <ul className="mt-15 menu bg-gray-900 text-white shadow-lg min-w-full gap-2 text-base-content min-h-full p-4">
      <li>
        <Link
          to="me"
          onClick={onNavItemClick}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyan-600 transition duration-300"
        >
          <User className="text-cyan-400" />
          My Profile
        </Link>
      </li>
      <li>
        <Link
          to="MyBookings"
          onClick={onNavItemClick}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          <RiShoppingCart2Line className="text-blue-400" />
          My Bookings
        </Link>
      </li>
      <li>
        <Link
          to="Payments"
          onClick={onNavItemClick}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-600 transition duration-300"
        >
          <CreditCard className="text-yellow-400" />
          Payments
        </Link>
      </li>
      <li>
        <Link
          to="supportTickets"
          onClick={onNavItemClick}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-600 transition duration-300"
        >
          <Ticket className="text-green-400" />
          Support Tickets
        </Link>
      </li>
        
         <li>
        <Link
          to="MyTickets"
          onClick={onNavItemClick}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-600 transition duration-300"
        >
          <Ticket className="text-green-400" />
          My tickets
        </Link>
      </li>

      <li>
        <Link
          to="/"
          onClick={onNavItemClick}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-600 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-house text-green-500"
          >
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Home
        </Link>
      </li>
      <li>
        <Link
          to="#"
          onClick={onNavItemClick}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition duration-300"
        >
          <LogOut className="text-red-400" />
          Logout
        </Link>
      </li>
    </ul>
  );
};
