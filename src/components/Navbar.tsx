import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../App/store";
import { clearCredentials } from "../features/Auth/AuthSlice";
import {
  Home,
  Info,
  CalendarDays,
  UserPlus,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  UserCheck,
  Phone,
} from "lucide-react";
import Typed from "typed.js";

import "./animate.css"; // includes font-chewy class
import { ThemeToggle } from "./ThemeToggle";
import { useGetUserByNationalIdQuery } from "../features/APIS/UserApi";

export const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const firstName = useSelector((state: RootState) => state.auth.user?.firstName);
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);
  const role = useSelector((state: RootState) => state.auth.role);

  const { data: userData } = useGetUserByNationalIdQuery(nationalId!, { skip: !nationalId });
  const profileImageUrl = userData?.profileImageUrl;

  const isActive = (path: string) => location.pathname === path ? "text-primary font-bold" : "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ["TicketStream ", "TicketStream ", "Book. Enjoy. Repeat."],
      typeSpeed: 100,
      backSpeed: 30,
      showCursor: true,
      cursorChar: '🎤',
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    setMenuOpen(false);
  };

  return (
    <>
      <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-base-300 ${
        scrolled ? "backdrop-blur bg-base-100/70 shadow-md" : "bg-base-100"
      }`}>
        <div className="navbar">
          <div className="navbar-start">
            <div className="dropdown">
              <button
                className="btn btn-ghost lg:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>
              <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow font-chewy text-lg">
                <li><Link className={isActive("/")} to="/" onClick={() => setMenuOpen(false)}><Home className="inline mr-2 h-4 w-4" /> Home</Link></li>
                <li><Link className={isActive("/about")} to="/about" onClick={() => setMenuOpen(false)}><Info className="inline mr-2 h-4 w-4" /> About</Link></li>
                <li><Link className={isActive("/events")} to="/events" onClick={() => setMenuOpen(false)}><CalendarDays className="inline mr-2 h-4 w-4" /> Events</Link></li>
                <li><Link className={isActive("/contact")} to="/contact" onClick={() => setMenuOpen(false)}><Phone className="inline mr-2 h-4 w-4" /> Contact</Link></li>
                <li><ThemeToggle /></li>
                {!isAuthenticated && (
                  <>
                    <li><Link className={isActive("/register")} to="/register" onClick={() => setMenuOpen(false)}><UserPlus className="inline mr-2 h-4 w-4" /> Register</Link></li>
                    <li><Link className={isActive("/login")} to="/login" onClick={() => setMenuOpen(false)}><LogIn className="inline mr-2 h-4 w-4" /> Login</Link></li>
                  </>
                )}
              </ul>
            </div>
            <Link to="/" className="btn btn-ghost text-xl font-bold flex items-center gap-1">
              <span ref={typedRef} className="tracking-wide text-primary font-updock text-3xl" />
            </Link>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 font-chewy text-lg">
              <li><Link className={isActive("/")} to="/"><Home className="inline mr-2 h-4 w-4" /> Home</Link></li>
              <li><Link className={isActive("/about")} to="/about"><Info className="inline mr-2 h-4 w-4" /> About</Link></li>
              <li><Link className={isActive("/events")} to="/events"><CalendarDays className="inline mr-2 h-4 w-4" /> Events</Link></li>
              <li><Link className={isActive("/contact")} to="/contact"><Phone className="inline mr-2 h-4 w-4" /> Contact</Link></li>
            </ul>
          </div>

          <div className="navbar-end flex gap-2 items-center">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="dropdown dropdown-end group">
                <label tabIndex={0} className="flex items-center cursor-pointer">
                  <div className="btn btn-outline btn-primary capitalize flex items-center gap-2">
                    <img
                      src={profileImageUrl || '/default-avatar.png'}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover border"
                    />
                    Hey {firstName}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  </div>
                </label>
                <ul tabIndex={0} className="menu dropdown-content bg-base-100 shadow rounded-box w-52 mt-2 z-20">
                  <li>
                    {role === "admin" ? (
                      <Link to="/AdminDashBoard/analytics" className="font-bold flex items-center gap-2">
                        <UserCheck className="h-5 w-5" /> Admin Dashboard
                      </Link>
                    ) : (
                      <Link to="/dashboard" className="font-bold flex items-center gap-2">
                        <User className="h-5 w-5" /> User Dashboard
                      </Link>
                    )}
                  </li>
                  <li>
                    <button onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="h-5 w-5" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="hidden lg:flex gap-2 font-chewy text-lg">
                <Link to="/register" className={`btn btn-ghost ${isActive("/register")}`}><UserPlus className="inline mr-2 h-4 w-4" /> Register</Link>
                <Link to="/login" className={`btn ${isActive("/login")}`}><LogIn className="inline mr-2 h-4 w-4" /> Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom navbar for small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 backdrop-blur bg-base-100/40 shadow-md border-t animate-glow">
        <ul className="flex justify-around items-center py-2 font-chewy text-base">
          <li><Link to="/" className={`flex flex-col items-center ${isActive("/")}`}><Home className="h-5 w-5" /><span className="text-xs">Home</span></Link></li>
          <li><Link to="/about" className={`flex flex-col items-center ${isActive("/about")}`}><Info className="h-5 w-5" /><span className="text-xs">About</span></Link></li>
          <li><Link to="/events" className={`flex flex-col items-center ${isActive("/events")}`}><CalendarDays className="h-5 w-5" /><span className="text-xs">Events</span></Link></li>
          <li><Link to="/contact" className={`flex flex-col items-center ${isActive("/contact")}`}><Phone className="h-5 w-5" /><span className="text-xs">Contact</span></Link></li>
        </ul>
      </div>
    </>
  );
};
