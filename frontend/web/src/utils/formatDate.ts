import { format, formatDistanceToNow, parseISO } from "date-fns";

export const formatDate = (date: string | Date, pattern = "dd MMM yyyy"): string => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd MMM yyyy, HH:mm");
};

export const formatRelative = (date: string | Date): string => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatMonthYear = (month: number, year: number): string => {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
};
