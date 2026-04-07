const clockFormatter = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
});

const fullFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatClock(iso: string) {
  return clockFormatter.format(new Date(iso));
}

export function formatTimestamp(iso: string) {
  return fullFormatter.format(new Date(iso));
}
