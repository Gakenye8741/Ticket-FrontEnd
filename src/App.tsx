import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Events } from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import { AdminDashBoard } from './pages/AdminDashBoard';
import { DAshboard } from './pages/DAshboard';
import ProtectedRoutes from './components/ProtectedRoutes';
import Error from './pages/Error';
import UserProfile from './DashBoards/dashboard/UserProfile';
import { Analytics } from './DashBoards/adminDashboard/Analytics';
import { AllUsers } from './DashBoards/adminDashboard/AllUsers';
import { AllVenues } from './DashBoards/adminDashboard/AllVenues';
import { EventDetailsPage } from './DashBoards/adminDashboard/AllEvents';
import BookingsByNationalId from './DashBoards/dashboard/BookingsById';
import { TicketTypes } from './DashBoards/adminDashboard/getAllTicketTypes';
import { AllBookings } from './DashBoards/adminDashboard/AllBookings';
import { EventDetailPage } from './content-folders/Events/eventPage';
import AllMedia from './DashBoards/adminDashboard/AllMedias';
import UserSupportTickets from './DashBoards/dashboard/SupportTickets';
import AdminSupportTickets from './DashBoards/adminDashboard/AllTicketSupport';
import ContactForm from './pages/Contact';
import GetPaymentsByNationalId from './DashBoards/dashboard/GetPaymentsByNationalId';
import AllPayments from './DashBoards/adminDashboard/GetAllPayments';
import RootLayout from './DashBoards/dashboardDesign/RootLayout';
import TicketDisplay from './DashBoards/dashboard/UserTickets';
import EmailVerification from './pages/EmailVerification';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/PasswordReset';
import SalesReport from './DashBoards/adminDashboard/SalesReport';
import AdminUserProfile from './DashBoards/adminDashboard/AdminUserProfile';
import { Toaster } from 'react-hot-toast';

function App() {
  const Router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout/>, // 👈 Apply TokenExpiryWatcher here
      children: [
        { path: '/', element: <Home /> },
        { path: '/about', element: <About /> },
        { path: '/events', element: <Events /> },
        { path: '/events/:id', element: <EventDetailPage /> },
        { path: '/login', element: <Login /> },
        { path: '/register', element: <Register /> },
        { path: '/contact', element: <ContactForm /> },
        { path: "/email-verification", element: <EmailVerification />, errorElement: <Error /> },
        { path: "/forgot-password",element: <ForgotPassword />,errorElement: <Error /> },
        { path: "/reset-password/:token",element: <ResetPassword />,errorElement: <Error />,
  },
      ],
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
        { path: 'me', element: <UserProfile /> },
        { path: 'MyBookings', element: <BookingsByNationalId /> },
        { path: 'supportTickets', element: <UserSupportTickets /> },
        { path: 'Payments', element: <GetPaymentsByNationalId /> },
        { path: 'MyTickets', element: <TicketDisplay /> }
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
        { path: 'analytics', element: <Analytics /> },
        { path: 'AllMedia', element: <AllMedia /> },
        { path: 'AllBookings', element: <AllBookings /> },
        { path: 'supportTickets', element: <AdminSupportTickets /> },
        { path: 'allusers', element: <AllUsers /> },
        { path: 'AllVenues', element: <AllVenues /> },
        { path: 'AllEvents', element: <EventDetailsPage /> },
        { path: 'ticketTypes', element: <TicketTypes /> },
        { path: 'AllPayments', element: <AllPayments /> },
        { path: 'adminprofile', element: <AdminUserProfile /> },
        { path: 'SalesReports', element: <SalesReport /> },
        
      ],
    },
  ]);

  return(
    <>
      <Toaster position='top-right' reverseOrder={false}/>
      <RouterProvider router={Router} />
    </>
    
  ) 
}

export default App;
