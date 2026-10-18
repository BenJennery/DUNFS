const zone = "Europe/London";

function parts(date: Date) {
  const list = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => list.find((part) => part.type === type)?.value ?? "00";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/** Interprets a datetime-local value as Europe/London and returns an ISO instant. */
export function londonLocalToIso(local: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const shown = parts(utcGuess);
  const shownUtc = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute);
  return new Date(utcGuess.getTime() - (shownUtc - utcGuess.getTime())).toISOString();
}

export function toDatetimeLocal(iso: string) {
  const shown = parts(new Date(iso));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${shown.year}-${pad(shown.month)}-${pad(shown.day)}T${pad(shown.hour)}:${pad(shown.minute)}`;
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDay(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
