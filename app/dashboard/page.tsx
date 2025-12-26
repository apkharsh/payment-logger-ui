"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api, { clearTokenRefresh } from "@/lib/api";
import { AxiosError } from "axios";

interface User {
    id: number;
    email: string;
    name: string;
    role?: string;
}

interface Payment {
    id: number;
    amount: number;
    type: "CREDIT" | "DEBIT";
    description: string;
    date: string;
    category?: string;
}

interface PaymentsResponse {
    payments: Payment[];
    total: number;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filter, setFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    // Wrap fetchPayments in useCallback to fix the dependency warning
    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            // Construct query params based on filter
            const params = filter !== "ALL" ? `?type=${filter}` : "";
            const response = await api.get<PaymentsResponse>(
                `/ledgers${params}`
            );

            setPayments(response.data.payments);
        } catch (err) {
            console.error("Error fetching payments:", err);
            if (err instanceof AxiosError) {
                setError(
                    err.response?.data?.message || "Failed to load payments"
                );
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    }, [filter]); // Add filter as dependency

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            router.push("/login");
            return;
        }

        setUser(JSON.parse(storedUser));
        fetchPayments();
    }, [router, fetchPayments]); // Now includes fetchPayments

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            clearTokenRefresh();
            localStorage.removeItem("user");
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const getTotalAmount = () => {
        return payments.reduce((sum, payment) => {
            return payment.type === "CREDIT"
                ? sum + payment.amount
                : sum - payment.amount;
        }, 0);
    };

    const getFilteredStats = () => {
        const credits = payments
            .filter((p) => p.type === "CREDIT")
            .reduce((sum, p) => sum + p.amount, 0);

        const debits = payments
            .filter((p) => p.type === "DEBIT")
            .reduce((sum, p) => sum + p.amount, 0);

        return { credits, debits, balance: credits - debits };
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const stats = getFilteredStats();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold text-gray-900">
                                Payment Logger
                            </h1>
                            <div className="hidden md:flex gap-4">
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="px-4 py-2 text-blue-600 font-medium border-b-2 border-blue-600"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => router.push('/beneficiaries')}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Beneficiaries
                                </button>
                                <button
                                    onClick={() => router.push("/profile")}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Profile
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Credits
                                </p>
                                <p className="text-2xl font-bold text-green-600 mt-2">
                                    ₹{stats.credits.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-green-600"
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
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Debits
                                </p>
                                <p className="text-2xl font-bold text-red-600 mt-2">
                                    ₹{stats.debits.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-red-600"
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
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Balance
                                </p>
                                <p
                                    className={`text-2xl font-bold mt-2 ${
                                        stats.balance >= 0
                                            ? "text-blue-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    ₹{stats.balance.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-blue-600"
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Payments */}
                <div className="bg-white rounded-xl shadow">
                    {/* Filter Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="px-6 py-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter("ALL")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filter === "ALL"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    All Transactions
                                </button>
                                <button
                                    onClick={() => setFilter("CREDIT")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filter === "CREDIT"
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Credits
                                </button>
                                <button
                                    onClick={() => setFilter("DEBIT")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filter === "DEBIT"
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Debits
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Payments List */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-12">
                                <svg
                                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    No payments found
                                </h3>
                                <p className="text-gray-600">
                                    Start by adding your first payment
                                    transaction
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    payment.type === "CREDIT"
                                                        ? "bg-green-100"
                                                        : "bg-red-100"
                                                }`}
                                            >
                                                <svg
                                                    className={`w-6 h-6 ${
                                                        payment.type ===
                                                        "CREDIT"
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    {payment.type ===
                                                    "CREDIT" ? (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 4v16m8-8H4"
                                                        />
                                                    ) : (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M20 12H4"
                                                        />
                                                    )}
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {payment.description}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(
                                                        payment.date
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </p>
                                                {payment.category && (
                                                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                                        {payment.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-lg font-bold ${
                                                    payment.type === "CREDIT"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {payment.type === "CREDIT"
                                                    ? "+"
                                                    : "-"}
                                                ₹
                                                {payment.amount.toLocaleString()}
                                            </p>
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded ${
                                                    payment.type === "CREDIT"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {payment.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
