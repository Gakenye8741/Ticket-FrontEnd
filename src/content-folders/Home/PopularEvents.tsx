import React from "react";

import koroga from "../../../src/assets/event1.png";
import jazz from "../../../src/assets/event1.jpg";
import blankets from "../../../src/assets/wine.jpg";
import cakefest from "../../../src/assets/cake.jpg";
import restaurantweek from "../../../src/assets/event3.jpg";
import streetfood from "../../../src/assets/street.jpeg";

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  image: string;
}

const popularEvents: Event[] = [
  {
    id: "1",
    title: "Koroga Festival",
    location: "Nairobi Arboretum",
    date: "July 2024",
    image: koroga,
  },
  {
    id: "2",
    title: "Nairobi Jazz Festival",
    location: "Uhuru Park, Nairobi",
    date: "May 2024",
    image: jazz,
  },
  {
    id: "3",
    title: "Blankets & Wine",
    location: "Loresho Gardens, Nairobi",
    date: "June 2025",
    image: blankets,
  },
  {
    id: "4",
    title: "Cake Festival",
    location: "Nairobi Arboretum",
    date: "October 2025",
    image: cakefest,
  },
  {
    id: "5",
    title: "Nairobi Restaurant Week",
    location: "Various Restaurants, Nairobi",
    date: "February 2025",
    image: restaurantweek,
  },
  {
    id: "6",
    title: "Street Food Festival",
    location: "Jamhuri Showgrounds",
    date: "March 2025",
    image: streetfood,
  },
];

export const PopularEvents: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-base-100 text-base-content transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-primary mb-6">
          Popular Events We’ve Worked With
        </h2>

        <p className="text-base-content/70 text-center max-w-2xl mx-auto mb-12">
          We’re proud to have supported some of Kenya’s most iconic festivals and live shows—powering unforgettable experiences.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {popularEvents.map((event) => (
            <div
              key={event.id}
              className="card shadow-md bg-base-200 border border-base-300 hover:shadow-xl transition-transform hover:-translate-y-1 hover:scale-105"
            >
              <figure className="h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-primary">{event.title}</h3>
                <p className="text-sm text-base-content/60">{event.location}</p>
                <p className="text-sm text-base-content/50">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
