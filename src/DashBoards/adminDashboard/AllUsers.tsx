import { useState } from "react";
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  useDeleteUserMutation,
  useGetAllUsersProfilesQuery,
  useUpdateAdminUserMutation,
  useRegisterUserMutation,
} from "../../features/APIS/UserApi";

import "../adminDashboard/style.css";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";

interface userData {
  nationalId: number;
  address: string;
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const MySwal = withReactContent(Swal);

export const AllUsers = () => {
  const { data: AllUsersData = [], isLoading, error } =
    useGetAllUsersProfilesQuery({ pollingInterval: 30000 });

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateAdminUserMutation();
  const [registerUser] = useRegisterUserMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(10); // Pagination

  const filteredUsers = AllUsersData.filter((user: userData) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(lowerSearch) ||
      user.lastName.toLowerCase().includes(lowerSearch) ||
      user.nationalId.toString().includes(lowerSearch)
    );
  });

  const handleDelete = async (nationalId: number) => {
    const confirm = await MySwal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "glass-modal" },
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUser(nationalId).unwrap();
        MySwal.fire({
          title: "Deleted!",
          text: "User has been removed.",
          icon: "success",
          customClass: { popup: "glass-modal" },
        });
      } catch (err) {
        MySwal.fire({
          title: "Error!",
          text: "Failed to delete user.",
          icon: "error",
          customClass: { popup: "glass-modal" },
        });
      }
    }
  };

  const handleEdit = async (user: userData) => {
    const { value: formValues } = await MySwal.fire({
      title: `Edit ${user.firstName} ${user.lastName}`,
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="First Name" value="${user.firstName}">
        <input id="swal-input2" class="swal2-input" placeholder="Last Name" value="${user.lastName}">
        <input id="swal-input3" class="swal2-input" placeholder="Email" value="${user.email}">
        <input id="swal-input4" class="swal2-input" placeholder="New Password (optional)" type="password">
        <select id="swal-input5" class="swal2-input" style="background-color: #000; font-size: 1rem; padding: 0.5rem;">
          <option value="user" ${user.role === "user" ? "selected" : ""}>👤 User</option>
          <option value="admin" ${user.role === "admin" ? "selected" : ""}>🛡️ Admin</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      customClass: { popup: "glass-modal" },
      preConfirm: () => {
        const firstName = (document.getElementById("swal-input1") as HTMLInputElement).value;
        const lastName = (document.getElementById("swal-input2") as HTMLInputElement).value;
        const email = (document.getElementById("swal-input3") as HTMLInputElement).value;
        const password = (document.getElementById("swal-input4") as HTMLInputElement).value;
        const role = (document.getElementById("swal-input5") as HTMLSelectElement).value;

        if (!firstName || !lastName || !email || !role) {
          Swal.showValidationMessage("All fields except password are required.");
          return;
        }

        const payload: any = {
          nationalId: user.nationalId,
          firstName,
          lastName,
          email,
          role,
        };

        if (password) {
          payload.password = password;
        }

        return payload;
      },
    });

    if (formValues) {
      try {
        await updateUser(formValues).unwrap();
        MySwal.fire({
          title: "Success!",
          text: "User updated successfully.",
          icon: "success",
          customClass: { popup: "glass-modal" },
        });
      } catch (err) {
        MySwal.fire({
          title: "Error!",
          text: "Failed to update user.",
          icon: "error",
          customClass: { popup: "glass-modal" },
        });
      }
    }
  };

  const handleAddUser = async () => {
    const { value: formValues } = await MySwal.fire({
      title: "Add New User",
      html: `
        <input id="add-fname" class="swal2-input" placeholder="First Name">
        <input id="add-lname" class="swal2-input" placeholder="Last Name">
        <input id="add-email" class="swal2-input" placeholder="Email">
        <input id="add-password" class="swal2-input" placeholder="Password" type="password">
        <input id="add-id" class="swal2-input" placeholder="National ID" type="number">
        <input id="add-address" class="swal2-input" placeholder="Address">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Create",
      customClass: { popup: "glass-modal" },
      preConfirm: () => {
        const firstName = (document.getElementById("add-fname") as HTMLInputElement).value;
        const lastName = (document.getElementById("add-lname") as HTMLInputElement).value;
        const email = (document.getElementById("add-email") as HTMLInputElement).value;
        const password = (document.getElementById("add-password") as HTMLInputElement).value;
        const nationalId = Number((document.getElementById("add-id") as HTMLInputElement).value);
        const address = (document.getElementById("add-address") as HTMLInputElement).value;

        if (!firstName || !lastName || !email || !password || !nationalId || !address) {
          Swal.showValidationMessage("Please fill in all fields.");
          return;
        }

        return { firstName, lastName, email, password, nationalId, address };
      },
    });

    if (formValues) {
      try {
        await registerUser({ ...formValues }).unwrap();

        // Reset fields
        (document.getElementById("add-fname") as HTMLInputElement).value = "";
        (document.getElementById("add-lname") as HTMLInputElement).value = "";
        (document.getElementById("add-email") as HTMLInputElement).value = "";
        (document.getElementById("add-password") as HTMLInputElement).value = "";
        (document.getElementById("add-id") as HTMLInputElement).value = "";
        (document.getElementById("add-address") as HTMLInputElement).value = "";

        MySwal.fire({
          title: "Success!",
          text: "User created successfully.",
          icon: "success",
          customClass: { popup: "glass-modal" },
        });
      } catch (err) {
        MySwal.fire({
          title: "Error!",
          text: "Failed to create user.",
          icon: "error",
          customClass: { popup: "glass-modal" },
        });
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1950&q=80')",
      }}
    >
      <div className="w-full max-w-7xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-orange-400">All Users</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name or ID"
              className="px-4 py-2 w-full sm:w-64 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring focus:ring-cyan-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              ➕ Add User
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-red-400 text-center text-lg font-semibold">
            Something went wrong. Please try again.
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#22d3ee" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-cyan-200 text-lg">No matching users found.</div>
        ) : (
          <>
            <table className="min-w-full text-sm text-white">
              <thead>
                <tr className="bg-white/20 text-orange-300 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left">First Name</th>
                  <th className="px-4 py-3 text-left">Last Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">National ID</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Created At</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.slice(0, visibleCount).map((user: userData, index: number) => (
                  <tr
                    key={index}
                    className="hover:bg-white/10 transition duration-200 border-b border-white/10"
                  >
                    <td className="px-4 py-2">{user.firstName}</td>
                    <td className="px-4 py-2">{user.lastName}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.nationalId}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-green-600 text-white"
                            : "bg-yellow-500 text-black"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs"
                      >
                        <FaEdit/>
                      </button>
                      <button
                        onClick={() => handleDelete(user.nationalId)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs"
                      >
                        <FaDeleteLeft/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length > visibleCount && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 10)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
