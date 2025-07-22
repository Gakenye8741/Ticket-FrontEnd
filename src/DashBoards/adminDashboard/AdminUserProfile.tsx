import { useEffect, useState } from 'react';
import { FaCamera, FaEdit, FaTimes } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { SaveIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import type { RootState } from '../../App/store';
import { useUpdateUserMutation } from '../../features/APIS/UserApi';
import { updateUserData } from '../../features/Auth/AuthSlice'

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  password?: string;
}

export const AdminUserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => setIsModalOpen((prev) => !prev);

  const profilePicture =
    user?.profile_picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&background=4ade80&color=fff&size=128`;

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, role, navigate]);
   
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      address: user?.address || '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user?.nationalId) return;

    try {
      const payload = { nationalId: user.nationalId, ...data };

      const updatedUser = await updateUser(payload).unwrap();

      dispatch(updateUserData(updatedUser)); // ✅ Update Redux
      handleModalToggle();

      Swal.fire({
        icon: 'success',
        title: 'Profile updated!',
        toast: true,
        timer: 2000,
        position: 'top-end',
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Update failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to update profile',
        text: 'Please try again later.',
      });
    }
  };

  return (
    <div className="min-h-screen text-white py-10 px-5 bg-gray-900">
      <div className="max-w-4xl mx-auto rounded-lg shadow-lg p-5 bg-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-700 pb-5 mb-5">
          <div className="relative flex items-center gap-4 mb-4 md:mb-0">
            <img
              src={user?.profileUrl || profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-orange-500 object-cover"
            />
            <label className="absolute bottom-0 bg-orange-500 p-2 rounded-full cursor-pointer">
              <FaCamera />
              <input type="file" className="hidden" />
            </label>
            <div>
              <h2 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <button className="btn btn-warning flex items-center gap-2" onClick={() => {
            reset({
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              email: user?.email || '',
              address: user?.address || '',
              password: ''
            });
            handleModalToggle();
          }}>
            <FaEdit /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-4">
            <h3 className="text-2xl font-bold mb-3">Personal Information</h3>
            <p className="mb-2"><span className="font-bold">First Name:</span> {user?.firstName}</p>
            <p className="mb-2"><span className="font-bold">Last Name:</span> {user?.lastName}</p>
            <p className="mb-2"><span className="font-bold">Address:</span> {user?.address || 'N/A'}</p>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-4">
            <h3 className="text-2xl font-bold mb-3">Security Settings</h3>
            <p className="mb-2"><span className="font-bold">Email:</span> {user?.email}</p>
            <p className="mb-2"><span className="font-bold">Password:</span> ********</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-gray-900 border border-orange-500 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-orange-500">Edit Profile</h2>
              <button onClick={handleModalToggle} className="btn btn-sm btn-circle btn-ghost text-red-500">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-orange-400">First Name</label>
                <input
                  id="firstName"
                  className="input input-bordered w-full text-black"
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-orange-400">Last Name</label>
                <input
                  id="lastName"
                  className="input input-bordered w-full text-black"
                  {...register('lastName', { required: 'Last name is required' })}
                />
                {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-orange-400">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input input-bordered w-full text-black"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format',
                    },
                  })}
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-orange-400">Address</label>
                <input
                  id="address"
                  className="input input-bordered w-full text-black"
                  {...register('address')}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-orange-400">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input input-bordered w-full text-black"
                  placeholder="Leave blank to keep current password"
                  {...register('password')}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={isUpdating}
                >
                  <SaveIcon size={18} />
                  {isUpdating ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserProfile;
