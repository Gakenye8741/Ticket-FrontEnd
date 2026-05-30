import { 
  User, 
  LogOut, 
  CreditCard, 
  Ticket, 
  TicketCheck, 
  Home, 
  ShoppingBag, 
  ChevronRight, 
  LayoutGrid,
  Zap,
  QrCode
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../features/Auth/AuthSlice";

export const SideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
    onNavItemClick?.();
  };

  const menuItems = [
    { to: "/", label: "Explore", icon: <Home size={16} />, color: "text-slate-400" },
    { to: "me", label: "Profile", icon: <User size={16} />, color: "text-blue-500" },
    { to: "MyBookings", label: "Bookings", icon: <ShoppingBag size={16} />, color: "text-purple-500" },
    { to: "MyTickets", label: "Tickets", icon: <Ticket size={16} />, color: "text-orange-500" },
    { to: "Payments", label: "Billing", icon: <CreditCard size={16} />, color: "text-emerald-500" },
    { to: "supportTickets", label: "Support", icon: <TicketCheck size={16} />, color: "text-pink-500" },
    { to: "qr-codes", label: "QR Wallet", icon: <QrCode size={16} />, color: "text-indigo-500" },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-base-100/95 backdrop-blur-xl border-r border-base-content/5 shadow-2xl relative">
      
      {/* 1. BRANDING SECTION - Compact */}
      <div className="w-full p-6 mb-1">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="h-10 w-10 flex-shrink-0 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutGrid className="text-primary-content" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase italic truncate">TicketStream</h2>
            <p className="text-[8px] font-bold opacity-40 uppercase tracking-[0.2em]">Member Portal</p>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION LINKS - Slimmed down */}
      <nav className="flex-1 w-full px-3 overflow-y-auto">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20 mb-3 ml-3">Menu</p>
        <ul className="space-y-1 w-full">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.to) && item.to !== "/";
            const isHomeActive = location.pathname === "/" && item.to === "/";
            const active = isActive || isHomeActive;

            return (
              <li key={item.to} className="w-full">
                <Link
                  to={item.to}
                  onClick={onNavItemClick}
                  className={`group flex items-center justify-between w-full p-2.5 px-3 rounded-xl transition-all duration-300 ${
                    active 
                      ? "bg-primary text-primary-content" 
                      : "hover:bg-base-200 text-base-content/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${active ? "text-primary-content" : item.color}`}>
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest truncate">
                      {item.label}
                    </span>
                  </div>
                  {active && <ChevronRight size={12} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 3. FOOTER - Minimized */}
      <div className="w-full p-4 mt-auto">
        <div className="p-3 bg-base-200/50 rounded-xl mb-3 flex items-center justify-between">
           <div>
              <p className="text-[8px] font-black uppercase opacity-50">Membership</p>
              <p className="text-[10px] font-bold uppercase">VIP Access</p>
           </div>
           <Zap size={14} className="text-primary" />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-error/5 text-error hover:bg-error hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
};