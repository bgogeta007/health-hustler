import React, { useState, useEffect } from "react";
import { Edit, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import UserForm from "./UserForm";

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
}

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Check admin status for current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: adminCheck } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", user?.id)
        .single();

      const isAdmin = !!adminCheck;

      if (!isAdmin) {
        // Regular users only get their own profile
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id);

        if (error) throw error;
        return setUsers(data ? [{ ...data[0], is_admin: false }] : []);
      }

      // Admins get all profiles with admin status
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Get admin status for all users
      const { data: adminUsers } = await supabase
        .from("admin_users")
        .select("id");

      const adminIds = new Set(adminUsers?.map((u) => u.id) || []);

      const usersWithAdminStatus =
        profiles?.map((profile) => ({
          ...profile,
          is_admin: adminIds.has(profile.id),
        })) || [];

      setUsers(usersWithAdminStatus);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const filteredUsers = users.filter((user) => {
    const searchString = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchString) ||
      user.full_name?.toLowerCase().includes(searchString) ||
      user.email.toLowerCase().includes(searchString)
    );
  });

  // Run this once to make yourself admin
  const makeAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("admin_users").upsert([
      {
        id: user?.id,
        role: "admin", // or whatever your role column expects
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">
                User
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">
                Created
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-green-500 flex items-center justify-center text-white">
                      {user.username?.[0]?.toUpperCase() ||
                        user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">
                        {user.full_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      user.is_admin
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    }`}
                  >
                    {user.is_admin ? "Admin" : "User"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm dark:text-white">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && selectedUser && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowForm(false);
            setSelectedUser(null);
          }}
          onSubmit={fetchUsers}
        />
      )}
    </div>
  );
};

export default UsersTab;
