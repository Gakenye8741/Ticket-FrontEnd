import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-slate-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand / Logo */}
        <div>
          <h3 className="text-2xl font-extrabold text-emerald-400 mb-3">TicketStream</h3>
          <p className="text-sm text-slate-400">
            Discover top venues, host unforgettable events, and experience Kenya’s vibrant culture through spaces that inspire.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-emerald-400 transition">Home</Link></li>
            <li><Link to="/venues" className="hover:text-emerald-400 transition">Venues</Link></li>
            <li><Link to="/events" className="hover:text-emerald-400 transition">Events</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400 transition">About Us</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Contact Us</h4>
          <ul className="text-sm space-y-2">
            <li>Email: ticketeStream@gmail.com</li>
            <li>Phone: +254 712 345 678</li>
            <li>Location: Nairobi, Kenya</li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-emerald-400 transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-emerald-400 transition"><FaTwitter /></a>
            <a href="#" className="hover:text-emerald-400 transition"><FaInstagram /></a>
            <a href="#" className="hover:text-emerald-400 transition"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} TicketStream. All rights reserved.
      </div>
    </footer>
  );
};
