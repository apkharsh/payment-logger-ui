interface AlertProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={`mb-6 p-4 border rounded-lg flex items-start gap-3 ${
        isSuccess
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <svg
        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
          isSuccess ? "text-green-600" : "text-red-600"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isSuccess ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        )}
      </svg>
      <p className={`text-sm ${isSuccess ? "text-green-800" : "text-red-800"}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`ml-auto ${
          isSuccess
            ? "text-green-600 hover:text-green-800"
            : "text-red-600 hover:text-red-800"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
