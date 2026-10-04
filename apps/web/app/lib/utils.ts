import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const crc = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });

/** ₡14 000 */
export function formatPrice(value: number | null | undefined) {
  return `₡${crc.format(value ?? 0)}`;
}

export function isExternal(url: string) {
  return /^(https?:|mailto:|tel:)/.test(url);
}
