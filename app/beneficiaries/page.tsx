"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api, { setupTokenRefresh } from "@/lib/api";
import { AxiosError } from "axios";
import {
  User,
  Beneficiary,
  BeneficiaryEnrollRequest,
  BeneficiaryEnrollResponse,
  PaymentRequest,
  LedgerRecord,
} from "@/types";
import Navbar from "@/components/Navbar";
import Alert from "@/components/Alert";
import LoadingSpinner from "@/components/LoadingSpinner";
import BeneficiaryCard from "@/components/BeneficiaryCard";
import EmptyState from "@/components/EmptyState";
import AddBeneficiaryModal from "@/components/modals/AddBeneficiaryModal";
import SendPaymentModal from "@/components/modals/SendPaymentModal";

export default function BeneficiariesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const fetchBeneficiaries = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get<Beneficiary[]>(
        `/beneficiary/payer?payerId=${userId}`
      );
      setBeneficiaries(response.data);
    } catch (err) {
      console.error("Error fetching beneficiaries:", err);
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message || "Failed to load beneficiaries"
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    fetchBeneficiaries(userData.id);
    setupTokenRefresh(900);
  }, [router, fetchBeneficiaries]);

  const handleAddBeneficiary = async (formData: BeneficiaryEnrollRequest) => {
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await api.post<BeneficiaryEnrollResponse>(
        "/beneficiary/enroll",
        formData
      );

      setSuccessMessage(
        response.data.message || "Beneficiary added successfully!"
      );
      setShowAddModal(false);

      if (user) {
        await fetchBeneficiaries(user.id);
      }
    } catch (err) {
      console.error("Error adding beneficiary:", err);
      if (err instanceof AxiosError) {
        setFormError(
          err.response?.data?.message || "Failed to add beneficiary"
        );
      } else {
        setFormError("An unexpected error occurred");
      }
      throw err;
    }
  };

  const handleOpenPaymentModal = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setFormError("");
    setShowPaymentModal(true);
  };

  // ⭐ Updated function signature to include timestamp
  const handleSendPayment = async (paymentData: {
    amount: string;
    description: string;
    timestamp?: string; // ⭐ NEW: Optional timestamp field
  }) => {
    if (!user || !selectedBeneficiary) return;

    setFormError("");
    setSuccessMessage("");

    try {
      const paymentRequest: PaymentRequest = {
        payerId: user.id,
        payeeId:
          selectedBeneficiary.payeeId || selectedBeneficiary.id.toString(),
        amount: parseFloat(paymentData.amount),
        description: paymentData.description,
        // ⭐ NEW: Convert timestamp to ISO format, or use current time as default
        timestamp: paymentData.timestamp
          ? new Date(paymentData.timestamp).toISOString()
          : new Date().toISOString(),
      };

      await api.post<LedgerRecord>("/ledgers", paymentRequest);

      setSuccessMessage(
        `Payment of ₹${paymentData.amount} sent to ${selectedBeneficiary.payeeAlias} successfully!`
      );
      setShowPaymentModal(false);
      setSelectedBeneficiary(null);
    } catch (err) {
      console.error("Error sending payment:", err);
      if (err instanceof AxiosError) {
        setFormError(err.response?.data?.message || "Failed to send payment");
      } else {
        setFormError("An unexpected error occurred");
      }
      throw err;
    }
  };

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} currentPage="beneficiaries" />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Beneficiaries</h2>
            <p className="text-gray-600 mt-1">
              Manage your payment beneficiaries
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg
              className="w-5 h-5"
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
            Add Beneficiary
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />
        )}

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {/* Beneficiaries List */}
        <div className="bg-white rounded-xl shadow">
          {isLoading ? (
            <LoadingSpinner />
          ) : beneficiaries.length === 0 ? (
            <EmptyState
              title="No beneficiaries yet"
              description="Add your first beneficiary to start sending payments"
              actionLabel="Add Your First Beneficiary"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {beneficiaries.map((beneficiary) => (
                <BeneficiaryCard
                  key={beneficiary.id}
                  beneficiary={beneficiary}
                  onSendPayment={handleOpenPaymentModal}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddBeneficiaryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddBeneficiary}
        error={formError}
      />

      <SendPaymentModal
        isOpen={showPaymentModal}
        beneficiary={selectedBeneficiary}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedBeneficiary(null);
        }}
        onSubmit={handleSendPayment}
        error={formError}
      />
    </div>
  );
}
