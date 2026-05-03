export function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR"
  }).format(value / 100);
}

export function parseSqlDateTime(value: string | Date) {
  if (value instanceof Date) {
    return value;
  }
  return new Date(value.replace(" ", "T"));
}

export function formatEventDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parseSqlDateTime(value));
}

export function formatDateRange(start: string | Date, end: string | Date) {
  const startDate = parseSqlDateTime(start);
  const endDate = parseSqlDateTime(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  const startLabel = new Intl.DateTimeFormat("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(startDate);

  const endLabel = new Intl.DateTimeFormat("en-IE", sameDay ? { hour: "2-digit", minute: "2-digit" } : {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(endDate);

  return `${startLabel} - ${endLabel}`;
}

export function formatForDateTimeLocal(value: string | Date) {
  const date = parseSqlDateTime(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function toSqlDateTime(value: string) {
  return `${value.replace("T", " ")}:00`;
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
