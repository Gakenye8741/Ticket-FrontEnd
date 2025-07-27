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

  if (score <= 2) return { label: 'Weak', color: 'bg-error', percent: '33%' };
  if (score === 3 || score === 4) return { label: 'Medium', color: 'bg-warning', percent: '66%' };
  return { label: 'Strong', color: 'bg-success', percent: '100%' };
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
      toast.error('❌ National ID must be a number.');
      return;
    }

    try {       
      const loadingToastId = toast.loading('🚀 Creating Account...');
      const res = await registerUser(data).unwrap();
      toast.success(res?.message, { id: loadingToastId });
      navigate("/email-verification", {
        state: { email: data.email, message: res?.message || "Please verify your email to complete registration." }
      });
        } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.error || '❌ Something went wrong. Please try again.';
      toast.error(`🚫 Failed to register: ${errorMessage}`);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <Navbar />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-base-100 text-base-content">
        {/* Image Side */}
        <div className="hidden md:flex items-center justify-center">
          <img
            src={registerImage}
            alt="Event Registration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Side */}
        <div className="flex items-center justify-center p-8 mt-10">
          <div className="bg-base-200 shadow-xl rounded-2xl p-8 w-full max-w-md border-2 border-blue-500">
            <h2 className="text-3xl font-bold text-center mb-6 text-primary">
              📝 Create an Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* First & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label label-text font-medium">First Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Jane"
                    {...register('firstName', { required: true })}
                  />
                  {errors.firstName && (
                    <p className="text-error text-sm mt-1">First name is required.</p>
                  )}
                </div>
                <div>
                  <label className="label label-text font-medium">Last Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Doe"
                    {...register('lastName', { required: true })}
                  />
                  {errors.lastName && (
                    <p className="text-error text-sm mt-1">Last name is required.</p>
                  )}
                </div>
              </div>

              {/* National ID */}
              <div>
                <label className="label label-text font-medium">National ID</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="1234567890"
                  {...register('nationalId', { required: true, valueAsNumber: true })}
                />
                {errors.nationalId && (
                  <p className="text-error text-sm mt-1">National ID is required.</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="label label-text font-medium">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="jane@example.com"
                  {...register('email', { required: true })}
                />
                {errors.email && (
                  <p className="text-error text-sm mt-1">Email is required.</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="label label-text font-medium">Password</label>
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
                  <p className="text-error text-sm mt-1">Password is required.</p>
                )}
                {password && (
                  <div className="mt-2">
                    <div className="h-2 w-full rounded bg-base-300 overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrength(password).color}`}
                        style={{ width: getPasswordStrength(password).percent }}
                      />
                    </div>
                    <p className="text-sm mt-1 text-base-content">
                      Strength: <span className="capitalize">{getPasswordStrength(password).label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="label label-text font-medium">Phone</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="+254..."
                  {...register('contactPhone', { required: true })}
                />
                {errors.contactPhone && (
                  <p className="text-error text-sm mt-1">Phone number is required.</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? '🚀 Creating...' : '🎯 Create Account'}
              </button>

              {/* Already have account */}
              <p className="text-sm text-center mt-4 text-base-content">
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
