import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from 'moment'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp: number): string {
  // Validate timestamp to prevent "Invalid time value" errors
  if (!timestamp || isNaN(timestamp) || timestamp < 0) {
    return "Unknown date"
  }

  try {
    // Convert seconds to milliseconds if timestamp is in seconds (Unix timestamp)
    const milliseconds = timestamp < 1000000000000 ? timestamp * 1000 : timestamp
    const date = new Date(milliseconds)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown date"
    }

    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error, timestamp)
    return "Unknown date"
  }
}

export function formatCreditAmount(amount: number): string {
  return amount.toFixed(2)
}

export function formatCredits(credits: number | undefined | null): string {
  if (credits === undefined || credits === null) return '0';
  return credits.toLocaleString();
}

export function formatTimeLeft(expiryTimestamp: number): string {
  const now = moment();
  // Convert Unix timestamp to milliseconds if needed
  const expiry = moment(expiryTimestamp * 1000);
  
  if (now.isAfter(expiry)) {
    return "Expired";
  }

  const duration = moment.duration(expiry.diff(now));
  
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

