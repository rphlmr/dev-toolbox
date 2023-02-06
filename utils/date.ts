export function getToday(daysFromToday = 0) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  today.setDate(today.getDate() + daysFromToday);

  return today;
}

export const daysSinceNow = (date: string) =>
  Math.trunc(
    (getToday(1).getTime() - new Date(date).getTime()) / (1000 * 3600 * 24)
  );

export function formatISODate(dateString?: string | null) {
  if (!dateString) return "";

  return new Date(dateString).toISOString().split("T")[0];
}

export function formatDateInputConstraint(daysFromToday = 0) {
  const date = getToday(daysFromToday);

  return date.toISOString().split("T")[0];
}

export function dateToIsoString(date: Date): string;
export function dateToIsoString(date: null): null;
export function dateToIsoString(date: Date | null): string | null;
export function dateToIsoString(date: Date | null | null) {
  if (date) return date.toISOString();

  return null;
}
