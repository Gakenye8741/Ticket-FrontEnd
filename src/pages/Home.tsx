import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { EventCard } from "../content-folders/Home/EventsCard";
import App from "../content-folders/Home/HeroHomeSection";
import { PopularEvents } from "../content-folders/Home/PopularEvents";
import { VenueList } from "../content-folders/Home/Venue";

import { Fade, Slide, Zoom } from "react-awesome-reveal"; // Add more animations if needed

export const Home = () => {
  return (
    <div>
      <Navbar />

      {/* Hero Section - Fade In from Bottom */}
      <Fade triggerOnce cascade damping={0.1}>
        <App />
      </Fade>

      {/* Event Card Section - Slide In from Left */}
      <Slide triggerOnce direction="left" duration={600}>
        <EventCard />
      </Slide>

      {/* Venue List Section - Zoom In with Delay */}
      <Zoom triggerOnce delay={300} duration={700}>
        <VenueList />
      </Zoom>

      {/* Popular Events - Slide In from Right */}
      <Slide triggerOnce direction="right" duration={600}>
        <PopularEvents />
      </Slide>

      {/* Footer - Simple Fade In */}
      <Fade triggerOnce delay={200}>
        <Footer />
      </Fade>
    </div>
  );
};
