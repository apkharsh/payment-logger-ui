import { useState } from "react";

interface FilterTabsProps {
  currentFilter: "ALL" | "CREDIT" | "DEBIT";
  onFilterChange: (filter: "ALL" | "CREDIT" | "DEBIT") => void;
  onDateRangeApply: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export default function FilterTabs({
  currentFilter,
  onFilterChange,
  onDateRangeApply,
  isLoading = false,
}: FilterTabsProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState<{ start: string; end: string } | null>(null);

  const filters = [
    { key: "ALL" as const, label: "All Transactions", color: "blue", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
    { key: "CREDIT" as const, label: "Credits", color: "green", icon: "M12 4v16m8-8H4" },
    { key: "DEBIT" as const, label: "Debits", color: "red", icon: "M20 12H4" },
  ];

  const getColorClass = (color: string, isActive: boolean) => {
    if (!isActive) return "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200";
    
    const colorMap: Record<string, string> = {
      blue: "bg-blue-600 text-white shadow-md",
      green: "bg-green-600 text-white shadow-md",
      red: "bg-red-600 text-white shadow-md",
    };
    return colorMap[color];
  };

  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      setActiveDateRange({ start: startDate, end: endDate });
      onDateRangeApply(startDate, endDate); // ⭐ Only backend call on explicit "Apply"
    }
  };

  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setActiveDateRange(null);
    // ⭐ Pass empty strings to fetch all data
    onDateRangeApply("", "");
  };

  // ⭐ Quick date range presets - ONLY set the dates, don't call backend
  const applyQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const endStr = end.toISOString().split("T")[0];
    const startStr = start.toISOString().split("T")[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    // ⭐ REMOVED: onDateRangeApply call - user must click "Apply Filter"
    // ⭐ REMOVED: setActiveDateRange - only set on Apply
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 space-y-4">
        {/* Transaction Type Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => onFilterChange(filter.key)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getColorClass(
                  filter.color,
                  currentFilter === filter.key
                )}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filter.icon} />
                </svg>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Date Filter Toggle */}
          <button
            onClick={() => setShowDateFilters(!showDateFilters)}
            disabled={isLoading}
            className={`ml-auto px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              showDateFilters || activeDateRange
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Date Range
            {activeDateRange && (
              <span className="bg-opacity-20 px-2 py-0.5 rounded text-xs">Active</span>
            )}
          </button>
        </div>

        {/* Date Range Filters (Collapsible) */}
        {showDateFilters && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-gray-600 flex items-center">Quick select:</span>
              <button
                onClick={() => applyQuickFilter(7)}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last 7 days
              </button>
              <button
                onClick={() => applyQuickFilter(30)}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last 30 days
              </button>
              <button
                onClick={() => applyQuickFilter(90)}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last 90 days
              </button>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || new Date().toISOString().split("T")[0]}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split("T")[0]}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:col-span-2 lg:col-span-2">
                <button
                  onClick={handleApplyDateFilter}
                  disabled={!startDate || !endDate || isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Apply Filter
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearDateFilter}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              </div>
            </div>

            {/* Active Filter Display */}
            {activeDateRange && (
              <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  Showing transactions from {new Date(activeDateRange.start).toLocaleDateString()} to {new Date(activeDateRange.end).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
