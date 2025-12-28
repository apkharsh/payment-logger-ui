"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <ProtectedRoute>
      {user && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navbar currentPage="profile" />

          <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"></div>

              <div className="px-6 pb-6">
                <div className="flex items-end -mt-16 mb-4">
                  <div
                    className={`w-32 h-32 rounded-full ${getAvatarColor(
                      user.name
                    )} border-4 border-white shadow-lg flex items-center justify-center`}
                  >
                    <span className="text-4xl font-bold text-white">
                      {getInitials(user.name)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-lg text-gray-600">{user.email}</p>
                  {user.role && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mt-2">
                      {user.role}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
                Account Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    User ID
                  </label>
                  <p className="text-base text-gray-900 font-mono break-all">
                    {user.id}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <p className="text-base text-gray-900 break-all">
                    {user.email}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </label>
                  <p className="text-base text-gray-900">{user.name}</p>
                </div>

                {user.role && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Account Role
                    </label>
                    <p className="text-base text-gray-900">{user.role}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Change Password
                </button>
              </div>
            </div>
          </main>

          {/* Change Password Modal */}
          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
          />
        </div>
      )}
    </ProtectedRoute>
  );
}
