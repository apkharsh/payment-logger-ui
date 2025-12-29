"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { setupTokenRefresh } from "@/lib/api";
import { AxiosError } from "axios";
import AuthLayout from "@/components/auth/AuthLayout";

// Define types
interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
}

interface SignupResponse {
  user: User;
}

interface OtpResponse {
  message: string;
}

export default function SignupPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [error, setError] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [userName, setUserName] = useState("");
    const [passwordStrength, setPasswordStrength] = useState({
        strength: "",
        color: "",
    });
    const [errors, setErrors] = useState({ confirmPassword: "" });
    const [canResendOtp, setCanResendOtp] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const router = useRouter();

    const calculatePasswordStrength = (password: string) => {
        if (password.length === 0) {
            return { strength: "", color: "" };
        }

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength <= 2) {
            return { strength: "Weak", color: "bg-red-500" };
        } else if (strength <= 4) {
            return { strength: "Medium", color: "bg-yellow-500" };
        } else {
            return { strength: "Strong", color: "bg-green-500" };
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setFormData({ ...formData, password: newPassword });
        setPasswordStrength(calculatePasswordStrength(newPassword));

        if (
            formData.confirmPassword &&
            newPassword !== formData.confirmPassword
        ) {
            setErrors({ ...errors, confirmPassword: "Passwords do not match" });
        } else {
            setErrors({ ...errors, confirmPassword: "" });
        }
    };

    const handleConfirmPasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const confirmPass = e.target.value;
        setFormData({ ...formData, confirmPassword: confirmPass });

        if (confirmPass && formData.password !== confirmPass) {
            setErrors({ ...errors, confirmPassword: "Passwords do not match" });
        } else {
            setErrors({ ...errors, confirmPassword: "" });
        }
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Start countdown timer
    const startCountdown = () => {
        setCountdown(60);
        setCanResendOtp(false);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResendOtp(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Send OTP to email
    const handleSendOtp = async () => {
        if (!isValidEmail(formData.email)) {
            setOtpError("Please enter a valid email address");
            return;
        }

        setIsSendingOtp(true);
        setOtpError("");
        setOtpSuccess("");

        try {
            const response = await api.post<OtpResponse>('/auth/signup/send-otp', {
                email: formData.email,
            });

            setIsOtpSent(true);
            setOtpSuccess(response.data.message || "OTP sent to your email!");
            startCountdown();
        } catch (err) {
            console.error("Send OTP error:", err);

            if (err instanceof AxiosError) {
                const errorMessage = err.response?.data?.message || "Failed to send OTP";
                setOtpError(errorMessage);
            } else {
                setOtpError("An unexpected error occurred");
            }
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP");
            return;
        }

        setIsVerifyingOtp(true);
        setOtpError("");

        try {
            const response = await api.post<OtpResponse>('/auth/signup/verify-otp', {
                email: formData.email,
                otp: otp,
            });

            setIsOtpVerified(true);
            setOtpSuccess(response.data.message || "Email verified successfully!");
            setOtpError("");
        } catch (err) {
            console.error("Verify OTP error:", err);

            if (err instanceof AxiosError) {
                const errorMessage = err.response?.data?.message || "Invalid or expired OTP";
                setOtpError(errorMessage);
            } else {
                setOtpError("An unexpected error occurred");
            }
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isOtpVerified) {
            setError("Please verify your email with OTP first");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrors({ ...errors, confirmPassword: "Passwords do not match" });
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await api.post<SignupResponse>('/auth/signup', {
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
            });

            console.log("Signup successful:", response.data);

            if (response.data.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }

            setupTokenRefresh(900);

            // Show success screen
            setUserName(formData.fullName);
            setSignupSuccess(true);

            // Redirect after 3 seconds
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
            
        } catch (err) {
            console.error("Signup error:", err);

            if (err instanceof AxiosError) {
                const errorMessage = err.response?.data?.message || "Registration failed";
                setError(errorMessage);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Success Screen
    if (signupSuccess) {
        return (
            <AuthLayout 
                title="Account Created! 🎉" 
                subtitle={`Welcome aboard, ${userName}!`}
                icon="success"
                showFooter={false}
            >
                <div className="text-center">
                    <p className="text-gray-600 mb-6">
                        Your account has been successfully created.
                    </p>

                    {/* Loading indicator */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Redirecting to dashboard...</span>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    // ✅ Signup Form
    return (
        <AuthLayout 
            title="Create Account" 
            subtitle="Join us today and get started"
            icon="signup"
        >
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Input */}
                <div>
                    <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Full Name
                    </label>
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    fullName: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                </div>

                {/* Email Input with OTP Verification */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email Address
                    </label>
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            disabled={isOtpVerified}
                            className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 ${
                                isOtpVerified 
                                    ? "bg-gray-50 border-green-300" 
                                    : "border-gray-300"
                            }`}
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                });
                                setIsOtpSent(false);
                                setIsOtpVerified(false);
                                setOtp("");
                                setOtpError("");
                                setOtpSuccess("");
                            }}
                            required
                        />
                        {isOtpVerified && (
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    {/* Send OTP Button */}
                    {!isOtpVerified && isValidEmail(formData.email) && (
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || (isOtpSent && !canResendOtp)}
                            className="mt-3 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            {isSendingOtp ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                    </svg>
                                    {isOtpSent ? `Resend OTP ${countdown > 0 ? `(${countdown}s)` : ''}` : 'Send OTP'}
                                </>
                            )}
                        </button>
                    )}

                    {/* OTP Input Field (appears after OTP is sent) */}
                    {isOtpSent && !isOtpVerified && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-blue-800">
                                    We've sent a 6-digit code to <strong>{formData.email}</strong>
                                </p>
                            </div>

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setOtp(value);
                                            setOtpError("");
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifyingOtp || otp.length !== 6}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {isVerifyingOtp ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OTP Error Message */}
                    {otpError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-red-800">{otpError}</p>
                        </div>
                    )}

                    {/* OTP Success Message */}
                    {otpSuccess && isOtpVerified && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-green-800 font-medium">{otpSuccess}</p>
                        </div>
                    )}
                </div>

                {/* Password Input */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handlePasswordChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showPassword ? (
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
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            ) : (
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
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                                <div
                                    className={`h-1 flex-1 rounded ${
                                        formData.password.length > 0
                                            ? passwordStrength.color
                                            : "bg-gray-200"
                                    }`}
                                ></div>
                                <div
                                    className={`h-1 flex-1 rounded ${
                                        passwordStrength.strength ===
                                            "Medium" ||
                                        passwordStrength.strength ===
                                            "Strong"
                                            ? passwordStrength.color
                                            : "bg-gray-200"
                                    }`}
                                ></div>
                                <div
                                    className={`h-1 flex-1 rounded ${
                                        passwordStrength.strength ===
                                        "Strong"
                                            ? passwordStrength.color
                                            : "bg-gray-200"
                                    }`}
                                ></div>
                            </div>
                            <p
                                className={`text-xs ${
                                    passwordStrength.strength === "Weak"
                                        ? "text-red-600"
                                        : passwordStrength.strength ===
                                          "Medium"
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                }`}
                            >
                                Password strength:{" "}
                                {passwordStrength.strength}
                            </p>
                        </div>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Confirm Password
                    </label>
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            autoComplete="new-password"
                            className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 ${
                                errors.confirmPassword
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(
                                    !showConfirmPassword
                                )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={
                                showConfirmPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showConfirmPassword ? (
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
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            ) : (
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
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        required
                    />
                    <label
                        htmlFor="terms"
                        className="ml-2 text-sm text-gray-700"
                    >
                        I agree to the{" "}
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Privacy Policy
                        </a>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !isOtpVerified}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Creating account...
                        </>
                    ) : !isOtpVerified ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Verify Email First
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a
                    href="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    Sign in
                </a>
            </p>
        </AuthLayout>
    );
}
