import { useForm } from 'react-hook-form';
import loginImage from '../../src/assets/image-UqgNANsLtSGIkgMfhkxPvvVyfWIhWH.png';
import { Navbar } from '../components/Navbar';
import { toast, Toaster } from 'sonner';
import { userApi } from '../features/APIS/UserApi';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/Auth/AuthSlice';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginDetails {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDetails>();
  const [LoginUser, { isLoading }] = userApi.useLoginUserMutation();
  const navigate = useNavigate();
  const Dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginDetails) => {
    const loadingToastId = toast.loading("Logging In...");
    try {
      const res = await LoginUser(data).unwrap();
      toast.success('✅ Logged in successfully', { id: loadingToastId });
      Dispatch(setCredentials(res));
      navigate(res.role === 'admin' ? '/AdminDashboard/analytics' : '/');
    } catch (error: any) {
      const ErrorMessage = error?.data?.error?.error || error?.data?.error || error?.error || '❌ Something went wrong. Please try again.';

      // Check if the error is related to email verification
      if (ErrorMessage.toLowerCase().includes('verify your email')) {
        toast.error('❌ Login failed: Please verify your email first', { id: loadingToastId });
        // Redirect to email verification page
        navigate('/email-verification', { state: { email: data.email } });
        return;
      }

      toast.error(`Failed to login: ${ErrorMessage}`, { id: loadingToastId });
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <Navbar />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-base-200 text-base-content transition-colors duration-300">
        {/* Image Side */}
        <div className="hidden md:block">
          <img
            src={loginImage}
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Side */}
        <div className="flex items-center justify-center p-6">
          <div className="bg-base-200 shadow-xl rounded-2xl p-8 w-full max-w-md border-2 border-blue-500">
            <h2 className="text-3xl font-bold mb-6 text-center">🎓 TicketStream Login Portal</h2>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-1">📧 Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="Enter your email"
                  {...register('email', { required: true })}
                />
                {errors.email && (
                  <span className="text-error text-sm mt-1 block">Email is required.</span>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium mb-1">🔐 Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input input-bordered w-full pr-10"
                    placeholder="Enter your password"
                    {...register('password', { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-primary"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-error text-sm mt-1 block">Password is required.</span>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full mt-4 text-lg tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? '🚀 Logging in...' : '🎯 Login'}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-sm text-center mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
