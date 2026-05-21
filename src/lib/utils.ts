import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatKwh(value: number) {
  return `${value.toFixed(1)} kWh`;
}

export function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours24 >= 12 ? "p. m." : "a. m.";
  const hours12 = hours24 % 12 || 12;

  return `${day}/${month}/${year}, ${hours12}:${minutes} ${period}`;
}
