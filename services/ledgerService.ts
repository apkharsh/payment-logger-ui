import api from "@/lib/api";
import { Payment } from "@/types";

/**
 * Fetch ledgers with optional date range filter
 */
export async function fetchLedgersWithDateRange(
  startDate?: string,
  endDate?: string
): Promise<Payment[]> {
  // ⭐ Build query params object
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  // ⭐ Make request with params
  const response = await api.get<Payment[]>("/ledgers", { params });
  
  return response.data;
}
