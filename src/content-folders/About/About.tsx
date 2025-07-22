import React from "react";
import { useNavigate } from "react-router-dom";

export const AboutEvent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen py-20 px-6 bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-emerald-400 mb-4">
            About TicketStream 🎫
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            At <span className="text-emerald-300 font-semibold">TicketStream</span>, we connect people with unforgettable experiences—empowering organizers and guiding attendees to the best events and venues across Kenya and beyond.
          </p>
        </div>

        {/* Core Sections */}
        <div className="grid gap-12 md:grid-cols-2">
          {/* Mission */}
          <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
            <h2 className="text-2xl font-bold text-emerald-300 mb-3">Our Mission</h2>
            <p className="text-slate-300">
              To revolutionize the way events are discovered, attended, and enjoyed in East Africa—creating seamless experiences from ticketing to the final applause.
            </p>
          </div>

          {/* What We Offer */}
          <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
            <h2 className="text-2xl font-bold text-emerald-300 mb-3">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Discover trending concerts, festivals, expos & shows</li>
              <li>Access real-time event updates and notifications</li>
              <li>Easy and secure ticket purchases</li>
              <li>Tools for event organizers to manage and grow their audience</li>
            </ul>
          </div>

          {/* Partners */}
          <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
            <h2 className="text-2xl font-bold text-emerald-300 mb-3">Who We Work With</h2>
            <p className="text-slate-300">
              We proudly support local promoters, music festivals, corporate events, university shows, and charity galas. If it brings people together, we’re there to help it shine.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
            <h2 className="text-2xl font-bold text-emerald-300 mb-3">Our Vision</h2>
            <p className="text-slate-300">
              To be East Africa’s leading hub for discovering and managing live events—bridging people, culture, and creativity through powerful digital experiences.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-24 bg-white/5 p-8 rounded-xl border border-white/10 backdrop-blur-sm shadow-inner">
          <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Why Choose TicketStream?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-slate-300">
            <div>
              <h4 className="font-semibold text-emerald-300 mb-2">Effortless Ticketing</h4>
              <p>Purchase and scan tickets easily with QR technology, no stress or printouts.</p>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-300 mb-2">Real-Time Event Updates</h4>
              <p>Stay informed with alerts, changes, and last-minute deals via mobile & web.</p>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-300 mb-2">Data-Driven Tools</h4>
              <p>Organizers get insights, analytics, and management tools to scale events efficiently.</p>
            </div>
          </div>
        </div>

        {/* Visual (optional if you have image assets) */}
        {/* <div className="mt-16 text-center">
          <img src="/assets/your-event-collage.jpg" alt="Event showcase" className="rounded-xl shadow-lg mx-auto max-w-full h-auto" />
        </div> */}

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl text-emerald-400 font-semibold mb-3">
            Ready to Streamline Your Event?
          </h3>
          <p className="text-slate-400 mb-6">
            Whether you're hosting or attending—we’re here to make your experience seamless, exciting, and unforgettable.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Explore Upcoming Events
          </button>
        </div>
      </div>
    </section>
  );
};
