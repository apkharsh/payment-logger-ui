import { Payment } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useRelativeTime, getFullDate } from "@/hooks/relativeTime";

interface PaymentCardProps {
  payment: Payment;
}

export default function PaymentCard({ payment }: PaymentCardProps) {
  const { user } = useAuth();
  
  // Determine if this is a credit or debit based on current user
  const isCredit = user && payment.payeeId === user.id;
  const type = isCredit ? "CREDIT" : "DEBIT";
  
  // Get the other party's info (already loaded from backend)
  const otherParty = isCredit ? payment.payer : payment.payee;
  
  // ⭐ Use custom hook for auto-updating relative time
  const relativeTime = useRelativeTime(payment.timestamp);
  const fullDate = getFullDate(payment.timestamp);

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isCredit ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <svg
            className={`w-6 h-6 ${
              isCredit ? "text-green-600" : "text-red-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCredit ? (
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

        {/* Details */}
        <div>
          <p className="font-medium text-gray-900">{payment.description}</p>
          
          {/* Show other party name/email */}
          {otherParty ? (
            <p className="text-sm text-gray-600 mt-0.5">
              {isCredit ? "From: " : "To: "}
              <span className="font-medium">{otherParty.name}</span>
              <span className="text-gray-500 ml-1">({otherParty.email})</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-0.5">
              {isCredit ? "From: " : "To: "}
              <span className="italic">User not found</span>
            </p>
          )}
          
          {/* ⭐ Timestamp with relative time and tooltip */}
          <div className="flex items-center gap-2 mt-1">
            <svg 
              className="w-3 h-3 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p 
              className="text-xs text-gray-500 cursor-help" 
              title={fullDate}
            >
              {relativeTime}
            </p>
          </div>
          
          {payment.category && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              {payment.category}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p
          className={`text-lg font-bold ${
            isCredit ? "text-green-600" : "text-red-600"
          }`}
        >
          {isCredit ? "+" : "-"}₹{payment.amount.toLocaleString("en-IN")}
        </p>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            isCredit
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {type}
        </span>
      </div>
    </div>
  );
}
