import { useState, useEffect } from "react";

export function useRelativeTime(timestamp: string) {
  const [relativeTime, setRelativeTime] = useState("");

  useEffect(() => {
    const formatRelativeTime = () => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      // Today - within last 24 hours
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

      // Older - show full date
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    setRelativeTime(formatRelativeTime());

    // ⭐ Update every minute to keep "X min ago" accurate
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [timestamp]);

  return relativeTime;
}

export function getFullDate(timestamp: string) {
  return new Date(timestamp).toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
