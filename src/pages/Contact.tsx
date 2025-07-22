import React, { useRef } from "react";
import emailjs from "emailjs-com";
import { toast, Toaster } from "react-hot-toast";
import {
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";
import SplashCursor from "../animations/SplashCursor";
import { Navbar } from "../components/Navbar";

// 🔑 Replace with your actual EmailJS credentials
const SERVICE_ID = "service_36rahuf";
const TEMPLATE_ID = "template_t7k2dxh";
const PUBLIC_KEY = "mSrGC2dXclojT6ci1";

const ContactSection: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const sendEmail = (e: React.FormEvent) => {
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
    );
  };

  return (
    <>
    <SplashCursor/>
    <Navbar/>
    
       <section
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1581091215367-59c71a18f115?auto=format&fit=crop&w=1740&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "4rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Toaster position="top-right" />
      <div
        style={{
          backdropFilter: "blur(16px)",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "2rem",
          maxWidth: "1100px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Left: About + Image + Socials */}
        <div>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            🎫 Manage Support Like a Pro
          </h2>
          <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            Our <strong>Ticket Stream Management System</strong> makes it easy
            to track, manage, and resolve customer issues in real time. With
            smart filtering, role-based access, and live chat integration, it's
            the fastest way to turn chaos into clarity.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            Boost productivity. Improve response time. Make customers happier —
            all from a single intuitive dashboard.
          </p>
          <img
            src="https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80"
            alt="Product preview"
            style={{
              width: "100%",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          />

          {/* Social Icons */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={iconStyle}
            >
              <FaInstagram />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              style={iconStyle}
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              style={iconStyle}
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={iconStyle}
            >
              <FaGithub />
            </a>
          </div>
        </div>

        {/* Right: Contact Form */}
        <form
          ref={formRef}
          onSubmit={sendEmail}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Contact Us
          </h3>
          <input
            name="from_name"
            placeholder="Your Name"
            required
            style={inputStyle}
          />
          <input
            name="from_email"
            type="email"
            placeholder="Your Email"
            required
            style={inputStyle}
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows={6}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            📩 Send Message
          </button>
        </form>
      </div>
    </section>
    </>
    
  );
};

// Glass-style input field
const inputStyle: React.CSSProperties = {
  padding: "0.8rem",
  borderRadius: "8px",
  border: "none",
  fontSize: "1rem",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  color: "#fff",
  backdropFilter: "blur(4px)",
  outline: "none",
};

// Glass-style button
const buttonStyle: React.CSSProperties = {
  padding: "0.8rem",
  backgroundColor: "#0d6efd",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background 0.3s",
};

// Icon style
const iconStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "1.5rem",
  transition: "color 0.3s",
};

export default ContactSection;
