import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Events } from './pages/Events'
import Login from './pages/Login'
import Register from './pages/Register'
import { AdminDashBoard } from './pages/AdminDashBoard'
import { DAshboard } from './pages/DAshboard'
import ProtectedRoutes from './components/ProtectedRoutes'
import Error from './pages/Error'
import UserProfile from './DashBoards/dashboard/UserProfile'
import { Analytics } from './DashBoards/adminDashboard/Analytics'
import { AdminUserProfile } from '../src/DashBoards/adminDashboard/AdminUserProfile'
import { AllUsers } from './DashBoards/adminDashboard/AllUsers'
import { AllVenues } from './DashBoards/adminDashboard/AllVenues'
import { EventDetailsPage } from './DashBoards/adminDashboard/AllEvents'
import BookingsByNationalId from './DashBoards/dashboard/BookingsById'
import { TicketTypes } from './DashBoards/adminDashboard/getAllTicketTypes'
import { AllBookings } from './DashBoards/adminDashboard/AllBookings'

// ✅ Import the new EventDetailPage
import { EventDetailPage } from '../src/content-folders/Events/eventPage' // Adjust the path if needed
import AllMedia from './DashBoards/adminDashboard/AllMedias'
import UserSupportTickets from './DashBoards/dashboard/SupportTickets'
import AdminSupportTickets from './DashBoards/adminDashboard/AllTicketSupport'
import ContactForm from './pages/Contact'
import GetPaymentsByNationalId from './DashBoards/dashboard/GetPaymentsByNationalId'
import AllPayments from './DashBoards/adminDashboard/GetAllPayments'


function App() {
  const Router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '/events',
      element: <Events />,
    },
    {
      path: '/events/:id', // ✅ Route to single event detail page
      element: <EventDetailPage />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/contact',
      element: <ContactForm/>
    },
    {
      path: 'dashboard',
      element: (
        <ProtectedRoutes>
          <DAshboard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        {
          path: 'me',
          element: <UserProfile />,
        },
        {
          path: 'MyBookings',
          element: <BookingsByNationalId />,
        },
        {
          path: 'supportTickets',
          element: <UserSupportTickets />,
        },
         {
          path: 'Payments',
          element: <GetPaymentsByNationalId />,
        },
      ],
    },
    {
      path: 'admindashboard',
      element: (
        <ProtectedRoutes>
          <AdminDashBoard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        {
          path: 'analytics',
          element: <Analytics />,
        },
        {
          path: 'AllMedia',
          element: <AllMedia/>
        },
        {
          path: 'AllBookings',
          element: <AllBookings />,
        },
        {
          path: 'supportTickets',
          element: <AdminSupportTickets/>,
        },
        {
          path: 'allusers',
          element: <AllUsers />,
        },
        {
          path: 'AllVenues',
          element: <AllVenues />,
        },
        {
          path: 'AllEvents',
          element: <EventDetailsPage />,
        },
        {
          path: 'ticketTypes',
          element: <TicketTypes />,
        },
         {
          path: 'AllPayments',
          element: <AllPayments />,
        },
        {
          path: 'adminprofile',
          element: <AdminUserProfile />,
        },
      ],
    },
  ]);

  return <RouterProvider router={Router} />;
}

export default App;
