import React, { useRef } from "react";
import emailjs from "emailjs-com";
import { toast, Toaster } from "react-hot-toast";
import { FaInstagram, FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import SplashCursor from "../animations/SplashCursor";
import { Navbar } from "../components/Navbar";

// EmailJS Credentials
const SERVICE_ID = "service_36rahuf";
const TEMPLATE_ID = "template_t7k2dxh";
const PUBLIC_KEY = "mSrGC2dXclojT6ci1";

const ContactSection: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    toast.promise(
      emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY),
      {
        loading: "Sending your message...",
        success: () => {
          formRef.current?.reset();
          return "✅ Message sent successfully!";
        },
        error: "❌ Failed to send. Try again.",
      }
    ).catch((err) => {
      console.error("EmailJS error:", err);
      toast.error("Unexpected error occurred.");
    });
  };

  return (
    <>
      <SplashCursor />
      <Navbar />

      <section className="min-h-screen flex items-center justify-center bg-base-100 text-base-content px-4 py-16">
        <Toaster position="top-right" />
        <div className="w-full max-w-6xl rounded-2xl shadow-xl border border-base-300 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-base-100">
          {/* Left Info */}
          <div>
            <h2 className="text-3xl font-bold mb-4">🎫 Manage Support Like a Pro</h2>
            <p className="mb-3 leading-relaxed">
              Our <span className="font-semibold">Ticket Stream Management System</span> helps you track, manage, and resolve issues in real time.
            </p>
            <p className="mb-6">Boost productivity. Improve response time. Keep customers happy.</p>
            <img
              src="https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80"
              alt="Product"
              className="rounded-xl mb-6 shadow-md"
            />
            <div className="flex gap-4 text-xl">
              <SocialLink href="https://instagram.com"><FaInstagram /></SocialLink>
              <SocialLink href="https://twitter.com"><FaTwitter /></SocialLink>
              <SocialLink href="https://linkedin.com"><FaLinkedin /></SocialLink>
              <SocialLink href="https://github.com"><FaGithub /></SocialLink>
            </div>
          </div>

          {/* Contact Form */}
          <form ref={formRef} onSubmit={sendEmail} className="flex flex-col gap-4">
            <h3 className="text-2xl font-bold mb-2">Contact Us</h3>
            <input
              name="from_name"
              type="text"
              placeholder="Your Name"
              className="input input-bordered w-full"
              required
            />
            <input
              name="from_email"
              type="email"
              placeholder="Your Email"
              className="input input-bordered w-full"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              className="textarea textarea-bordered w-full h-32"
              required
            />
            <button type="submit" className="btn btn-primary w-full">
              📩 Send Message
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

// Reusable Social Link
const SocialLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-primary transition-colors"
  >
    {children}
  </a>
);

export default ContactSection;
