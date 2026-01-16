import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAge(age: number): string {
  return age.toFixed(1);
}

export function formatAgeReduction(chronological: number, biological: number): string {
  const reduction = chronological - biological;
  const sign = reduction >= 0 ? "-" : "+";
  return `${sign}${Math.abs(reduction).toFixed(1)} years`;
}

export function calculatePaceOfAging(chronological: number, biological: number): number {
  return biological / chronological;
}

export function formatPaceOfAging(pace: number): string {
  return `${(pace * 100).toFixed(0)}%`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBTC(amount: number): string {
  return `${amount.toFixed(4)} BTC`;
}

export function truncateAddress(address: string, chars: number = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getGenerationFromBirthYear(birthYear: number): string {
  if (birthYear >= 2013) return "Gen Alpha";
  if (birthYear >= 1997) return "Gen Z";
  if (birthYear >= 1981) return "Millennial";
  if (birthYear >= 1965) return "Gen X";
  if (birthYear >= 1946) return "Baby Boomer";
  return "Silent Generation";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a URL-safe slug from a string
 * Unified implementation to replace duplicated slug generation
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 */
export async function generateUniqueSlug(
  baseText: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = slugify(baseText);
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
