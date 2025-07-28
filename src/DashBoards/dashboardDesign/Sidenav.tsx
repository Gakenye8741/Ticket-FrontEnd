import { User, LogOut, CreditCard, Ticket, TicketCheck } from "lucide-react";
import { RiShoppingCart2Line } from "react-icons/ri";
import { Link } from "react-router-dom";

export const SideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  return (
    <aside className="min-h-full bg-base-200 text-base-content border rounded-xl shadow-lg p-4 mt-16">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary" >
        🚀 User Dashboard 🚀
      </h2>

      <ul className="menu gap-2 text-base-content">
        <li>
          <Link
            to="me"
            onClick={onNavItemClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary hover:text-primary-content transition duration-300"
          >
            <User className="text-primary" />
            My Profile
          </Link>
        </li>
        <li>
          <Link
            to="MyBookings"
            onClick={onNavItemClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary hover:text-secondary-content transition duration-300"
          >
            <RiShoppingCart2Line className="text-secondary" />
            My Bookings
          </Link>
        </li>
        <li>
          <Link
            to="Payments"
            onClick={onNavItemClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-content transition duration-300"
          >
            <CreditCard className="text-warning" />
            Payments
          </Link>
        </li>
        <li>
          <Link
            to="supportTickets"
            onClick={onNavItemClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-500 hover:text-accent-content transition duration-300"
          >
            <TicketCheck className="text-success" />
            Support Tickets
          </Link>
        </li>
        <li>
          <Link
            to="MyTickets"
            onClick={onNavItemClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-content transition duration-300"
          >
            <Ticket className="text-success" />
            My Tickets
          </Link>
        </li>
        <li>
          <Link
            to="/"
            onClick={onNavItemClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-content transition duration-300"
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
              className="lucide lucide-house text-success"
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
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-error hover:text-error-content transition duration-300"
          >
            <LogOut className="text-error" />
            Logout
          </Link>
        </li>
      </ul>
    </aside>
  );
};
