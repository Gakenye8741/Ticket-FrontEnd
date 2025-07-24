import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-base-200 text-base-content py-12 px-6 border-t border-base-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand / Logo */}
        <div>
          <h3 className="text-2xl font-bold text-primary mb-3">TicketStream</h3>
          <p className="text-sm text-base-content/70">
            Discover top venues, host unforgettable events, and experience Kenya’s vibrant culture through spaces that inspire.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="link-hover link text-base-content/80">
                Home
              </Link>
            </li>
            <li>
              <Link to="/venues" className="link-hover link text-base-content/80">
                Venues
              </Link>
            </li>
            <li>
              <Link to="/events" className="link-hover link text-base-content/80">
                Events
              </Link>
            </li>
            <li>
              <Link to="/about" className="link-hover link text-base-content/80">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Contact Us</h4>
          <ul className="text-sm space-y-2 text-base-content/70">
            <li>Email: <a href="mailto:ticketeStream@gmail.com" className="link link-hover">ticketeStream@gmail.com</a></li>
            <li>Phone: +254 712 345 678</li>
            <li>Location: Nairobi, Kenya</li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
          <div className="flex gap-4 text-lg text-base-content/80">
            <a href="#" className="hover:text-primary transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-primary transition"><FaTwitter /></a>
            <a href="#" className="hover:text-primary transition"><FaInstagram /></a>
            <a href="#" className="hover:text-primary transition"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 pt-6 border-t border-base-300 text-center text-xs text-base-content/60">
        &copy; {new Date().getFullYear()} TicketStream. All rights reserved.
      </div>
    </footer>
  );
};
