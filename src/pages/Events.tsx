import { useEffect } from "react";
import toast from "react-hot-toast";

import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { EventDetailsPage } from "../content-folders/Events/EventsDetails";

export const Events = () => {
  useEffect(() => {
    toast.success("Welcome to the Events Page 🎟️");
  }, []);

  return (
    <div>
      <Navbar />
      <EventDetailsPage />
      <Footer />
    </div>
  );
};
