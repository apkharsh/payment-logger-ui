import { Beneficiary } from "@/types";

interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
  onSendPayment: (beneficiary: Beneficiary) => void;
}

export default function BeneficiaryCard({
  beneficiary,
  onSendPayment,
}: BeneficiaryCardProps) {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {beneficiary.payeeAlias.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {beneficiary.payeeAlias}
            </h3>
            <p className="text-sm text-gray-600">{beneficiary.payeeEmail}</p>
          </div>
        </div>
        <button
          onClick={() => onSendPayment(beneficiary)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Send Payment
        </button>
      </div>
    </div>
  );
}
