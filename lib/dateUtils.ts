/**
 * Convert local datetime-local input to UTC ISO string
 */
export function localDateTimeToUTC(localDateTime: string): string {
  if (!localDateTime) {
    return new Date().toISOString();
  }
  
  // datetime-local format: "2025-12-27T11:32"
  const date = new Date(localDateTime);
  return date.toISOString();
}

/**
 * Get current datetime in local datetime-local format
 */
export function getCurrentLocalDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Format relative time from UTC ISO string
 */
export function formatRelativeTime(utcString: string): string {
  const date = new Date(utcString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // Today
  if (diffInHours < 24 && date.getDate() === now.getDate()) {
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return minutes < 1 ? "Just now" : `${minutes} min ago`;
    }
    const hours = Math.floor(diffInHours);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday at ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Within last 7 days
  if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} ${
      Math.floor(diffInDays) === 1 ? "day" : "days"
    } ago`;
  }

  // Older
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format full date for tooltip
 */
export function formatFullDate(utcString: string): string {
  return new Date(utcString).toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
