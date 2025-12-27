interface StatsCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  colorClass: "green" | "red" | "blue";
}

export default function StatsCard({ title, amount, icon, colorClass }: StatsCardProps) {
  const colorClasses = {
    green: {
      text: "text-green-600",
      bg: "bg-green-100",
      icon: "text-green-600",
    },
    red: {
      text: "text-red-600",
      bg: "bg-red-100",
      icon: "text-red-600",
    },
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-100",
      icon: "text-blue-600",
    },
  };

  const colors = colorClasses[colorClass];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colors.text} mt-2`}>
            ₹{amount.toLocaleString()}
          </p>
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
          <div className={colors.icon}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
