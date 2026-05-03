const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

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

function formatTime(date: Date) {
  return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
}

function formatShortDate(date: Date) {
  return `${weekdayLabels[date.getDay()]}, ${date.getDate()} ${monthLabels[date.getMonth()]}`;
}

export function formatEventDate(value: string | Date) {
  const date = parseSqlDateTime(value);
  return `${formatShortDate(date)}, ${formatTime(date)}`;
}

export function formatDateRange(start: string | Date, end: string | Date) {
  const startDate = parseSqlDateTime(start);
  const endDate = parseSqlDateTime(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  const startLabel = `${formatShortDate(startDate)}, ${formatTime(startDate)}`;
  const endLabel = sameDay ? formatTime(endDate) : `${formatShortDate(endDate)}, ${formatTime(endDate)}`;

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
