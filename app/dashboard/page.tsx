"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { Payment } from "@/types";
import { fetchLedgersWithDateRange } from "@/services/ledgerService";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Alert from "@/components/Alert";
import EmptyState from "@/components/EmptyState";
import StatsCard from "@/components/dashboard/StatsCard";
import FilterTabs from "@/components/dashboard/FilterTabs";
import PaymentCard from "@/components/dashboard/PaymentCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ⭐ Fetch payments with optional date range
  const fetchPayments = useCallback(async (startDate?: string, endDate?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError("");

    try {
      // ⭐ Use the service function for all cases
      const data = await fetchLedgersWithDateRange(startDate, endDate);
      
      if (Array.isArray(data)) {
        console.log("Fetched payments with user details:", data);
        setPayments(data);
      } else {
        console.error("Unexpected response format:", data);
        setPayments([]);
        setError("Unexpected data format from server");
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to load payments");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ⭐ Initial load - fetch all payments
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ⭐ Handle date range filter
  const handleDateRangeApply = async (startDate: string, endDate: string) => {
    // ⭐ Convert empty strings to undefined
    await fetchPayments(
      startDate || undefined,
      endDate || undefined
    );
  };

  // ⭐ Client-side filtering by transaction type
  const getFilteredPayments = () => {
    if (!user || !Array.isArray(payments)) return [];

    if (filter === "CREDIT") {
      return payments.filter((p) => p.payeeId === user.id);
    } else if (filter === "DEBIT") {
      return payments.filter((p) => p.payerId === user.id);
    }
    
    return payments;
  };

  // ⭐ Calculate stats
  const getFilteredStats = () => {
    if (!user || !Array.isArray(payments)) {
      return { credits: 0, debits: 0, balance: 0 };
    }

    const credits = payments
      .filter((p) => p.payeeId === user.id)
      .reduce((sum, p) => sum + p.amount, 0);

    const debits = payments
      .filter((p) => p.payerId === user.id)
      .reduce((sum, p) => sum + p.amount, 0);

    return { credits, debits, balance: credits - debits };
  };

  const stats = getFilteredStats();
  const filteredPayments = getFilteredPayments();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="dashboard" />

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name || "User"}! 👋
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Credits"
              amount={stats.credits}
              colorClass="green"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            />

            <StatsCard
              title="Total Debits"
              amount={stats.debits}
              colorClass="red"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              }
            />

            <StatsCard
              title="Balance"
              amount={stats.balance}
              colorClass={stats.balance >= 0 ? "blue" : "red"}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* Filters and Payments */}
          <div className="bg-white rounded-xl shadow">
            <FilterTabs 
              currentFilter={filter} 
              onFilterChange={setFilter}
              onDateRangeApply={handleDateRangeApply}
              isLoading={isLoading}
            />

            {error && (
              <div className="mx-6 mt-6">
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError("")}
                />
              </div>
            )}

            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : filteredPayments.length === 0 ? (
                <EmptyState
                  title="No payments found"
                  description={
                    filter === "ALL"
                      ? "Start by adding your first payment transaction"
                      : `No ${filter.toLowerCase()} transactions found`
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <PaymentCard key={payment.id} payment={payment} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
