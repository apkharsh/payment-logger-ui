"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (!storedEmail) {
      router.push("/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/auth/password-reset/verify`, // ✅ FIXED: Added env variable
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: parseInt(otp),
          }),
        }
      );

      if (response.ok) {
        const message = await response.text();
        setSuccess("OTP verified! Redirecting...");
        setTimeout(() => {
          router.push("/reset-password");
        }, 1500);
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || "Invalid OTP");
        } catch {
          const errorText = await response.text();
          setError(errorText || "Invalid OTP");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await fetch(
        `/api/auth/password-reset/request`, // ✅ FIXED: Added env variable
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        const message = await response.text();
        setSuccess("New OTP sent successfully!");
        setCanResend(false);
        setCountdown(60);
        setOtp("");
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || "Failed to resend OTP");
        } catch {
          const errorText = await response.text();
          setError(errorText || "Failed to resend OTP");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/forgot-password"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Verify OTP
          </h1>
          <p className="text-center text-gray-600 mb-2">
            We sent a 6-digit code to
          </p>
          <p className="text-center text-indigo-600 font-semibold mb-8">
            {email}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter 6-Digit OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) setOtp(value);
                }}
                required
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Valid for 10 minutes • 3 attempts remaining
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive code?</p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Sending..."
                : canResend
                ? "Resend OTP"
                : `Resend in ${countdown}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
