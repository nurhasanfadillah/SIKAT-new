import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseDateIgnoreTimezone(dateInput: any): Date {
  if (!dateInput) return new Date();
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date();
  
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const date = parseInt(match[3], 10);
      return new Date(year, month, date);
    }
  }
  
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function formatIgnoreTimezone(dateInput: any, pattern: string, options?: any): string {
  const safeDate = parseDateIgnoreTimezone(dateInput);
  return format(safeDate, pattern, options);
}
