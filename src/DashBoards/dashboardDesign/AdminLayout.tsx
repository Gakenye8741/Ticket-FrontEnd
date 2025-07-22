import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSideNav } from "../dashboardDesign/AdminSidenav";
import { Menu } from "lucide-react";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen relative">
      {/* Hamburger Menu for Mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        aria-label="Open Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full bg-gray-900 text-white fixed top-0 left-0 z-30">
        <AdminSideNav onNavItemClick={() => {}} />
      </aside>

      {/* Mobile Sidebar + Overlay */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Mobile Sidebar */}
          <aside
            className="fixed top-0 left-0 z-50 w-64 h-full bg-gray-900 text-white transform transition-transform duration-300 md:hidden translate-x-0"
          >
            <AdminSideNav onNavItemClick={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:ml-64 w-full">
        <Outlet />
      </main>
    </div>
  );
};
