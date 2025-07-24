import React from "react";
import { useNavigate } from "react-router-dom";

export const AboutEvent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen py-20 px-6 bg-base-200 text-base-content">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-4">
            About TicketStream 🎫
          </h1>
          <p className="text-lg max-w-3xl mx-auto text-base-content/70">
            At <span className="text-primary font-semibold">TicketStream</span>, we connect people with unforgettable experiences—empowering organizers and guiding attendees to the best events and venues across Kenya and beyond.
          </p>
        </div>

        {/* Core Sections */}
        <div className="grid gap-12 md:grid-cols-2">
          {/* Mission */}
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-primary">Our Mission</h2>
              <p>
                To revolutionize the way events are discovered, attended, and enjoyed in East Africa—creating seamless experiences from ticketing to the final applause.
              </p>
            </div>
          </div>

          {/* What We Offer */}
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-primary">What We Offer</h2>
              <ul className="list-disc list-inside space-y-2 text-base-content/80">
                <li>Discover trending concerts, festivals, expos & shows</li>
                <li>Access real-time event updates and notifications</li>
                <li>Easy and secure ticket purchases</li>
                <li>Tools for event organizers to manage and grow their audience</li>
              </ul>
            </div>
          </div>

          {/* Partners */}
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-primary">Who We Work With</h2>
              <p>
                We proudly support local promoters, music festivals, corporate events, university shows, and charity galas. If it brings people together, we’re there to help it shine.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-primary">Our Vision</h2>
              <p>
                To be East Africa’s leading hub for discovering and managing live events—bridging people, culture, and creativity through powerful digital experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-24 card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-primary text-center mb-6">
              Why Choose TicketStream?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-base-content/80">
              <div>
                <h4 className="font-semibold text-primary mb-2">Effortless Ticketing</h4>
                <p>Purchase and scan tickets easily with QR technology—no stress or printouts.</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Real-Time Event Updates</h4>
                <p>Stay informed with alerts, changes, and last-minute deals via mobile & web.</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Data-Driven Tools</h4>
                <p>Organizers get insights, analytics, and management tools to scale events efficiently.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl text-primary font-semibold mb-3">
            Ready to Streamline Your Event?
          </h3>
          <p className="text-base-content/70 mb-6">
            Whether you're hosting or attending—we’re here to make your experience seamless, exciting, and unforgettable.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="btn btn-primary btn-wide"
          >
            Explore Upcoming Events
          </button>
        </div>
      </div>
    </section>
  );
};
