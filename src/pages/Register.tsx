import { useForm } from 'react-hook-form';
import registerImage from '../../src/assets/image-4TLovP5EoCnEpmnDaAcAiw2LIV7evw.png';
import { Navbar } from '../components/Navbar';
import { userApi } from '../features/APIS/UserApi';
import { toast, Toaster } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterDetails {
  nationalId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactPhone: string;
  address: string;
}

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&#^()\-_=+]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', percent: '33%' };
  if (score === 3 || score === 4) return { label: 'Medium', color: 'bg-yellow-500', percent: '66%' };
  return { label: 'Strong', color: 'bg-green-500', percent: '100%' };
};

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDetails>();

  const [registerUser, { isLoading }] = userApi.useRegisterUserMutation();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegisterDetails) => {
    const parsedData = {
      ...data,
      nationalId: Number(data.nationalId),
    };

    if (isNaN(parsedData.nationalId)) {
      toast.error("❌ National ID must be a number.");
      return;
    }

    try {
      const loadingToastId = toast.loading('🚀 Creating Account...');
      const res = await registerUser(parsedData).unwrap();
      toast.success('✅ Account created successfully!', { id: loadingToastId });
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.error || '❌ Something went wrong. Please try again.';
      toast.error(`🚫 Failed to register: ${errorMessage}`);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <Navbar />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-base-100">
        {/* Image Side */}
        <div className="hidden md:flex items-center justify-center">
          <img
            src={registerImage}
            alt="Event Registration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Side */}
        <div className="flex items-center justify-center p-8">
          <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg p-8 w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-6 text-primary">
              📝 Create an Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium mb-1">🧍‍♀️ First Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Jane"
                  {...register('firstName', { required: true })}
                />
                {errors.firstName && (
                  <span className="text-red-500 text-sm mt-1 block">First name is required.</span>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium mb-1">🧍 Last Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Doe"
                  {...register('lastName', { required: true })}
                />
                {errors.lastName && (
                  <span className="text-red-500 text-sm mt-1 block">Last name is required.</span>
                )}
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-medium mb-1">🆔 National ID</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="1234567890"
                  {...register('nationalId', { required: true, valueAsNumber: true })}
                />
                {errors.nationalId && (
                  <span className="text-red-500 text-sm mt-1 block">National ID is required.</span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">📧 Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="jane@example.com"
                  {...register('email', { required: true })}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1 block">Email is required.</span>
                )}
              </div>

              {/* Password with Strength */}
              <div>
                <label className="block text-sm font-medium mb-1">🔐 Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input input-bordered w-full pr-10"
                    placeholder="••••••••"
                    {...register('password', { required: true })}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1 block">Password is required.</span>
                )}

                {password && (
                  <div className="mt-2">
                    <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrength(password).color}`}
                        style={{ width: getPasswordStrength(password).percent }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                      Strength: <span className="capitalize">{getPasswordStrength(password).label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">📞 Contact Phone</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="+254**********"
                  {...register('contactPhone', { required: true })}
                />
                {errors.contactPhone && (
                  <span className="text-red-500 text-sm mt-1 block">Phone number is required.</span>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading}>
                {isLoading ? '🚀 Creating...' : '🎯 Create Account'}
              </button>

              {/* Login Link */}
              <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
