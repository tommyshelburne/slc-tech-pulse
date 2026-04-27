export interface ICalEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  url?: string;
  start?: string;
  end?: string;
}

function unfold(src: string): string[] {
  const raw = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  for (const line of raw) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescape(v: string): string {
  return v
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function parseDate(value: string, params: Record<string, string>): string | undefined {
  if (!value) return undefined;
  // 20260410T180000Z → ISO
  const utc = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
  if (utc) {
    const [, y, m, d, h, mi, s] = utc;
    return `${y}-${m}-${d}T${h}:${mi}:${s}.000Z`;
  }
  // 20260410T180000 with TZID=… → treat as local, emit without Z
  const local = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(value);
  if (local) {
    const [, y, m, d, h, mi, s] = local;
    return `${y}-${m}-${d}T${h}:${mi}:${s}`;
  }
  // Date-only VALUE=DATE: 20260410
  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return `${y}-${m}-${d}T00:00:00`;
  }
  return undefined;
}

function splitPropLine(line: string): { name: string; params: Record<string, string>; value: string } | null {
  const colon = line.indexOf(':');
  if (colon < 0) return null;
  const head = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const parts = head.split(';');
  const name = parts[0].toUpperCase();
  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const [k, v] = parts[i].split('=');
    if (k && v) params[k.toUpperCase()] = v;
  }
  return { name, params, value };
}

export function parseICal(source: string): ICalEvent[] {
  const lines = unfold(source);
  const events: ICalEvent[] = [];
  let current: Partial<ICalEvent> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current?.uid && current.summary) {
        events.push(current as ICalEvent);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const parsed = splitPropLine(line);
    if (!parsed) continue;
    const { name, params, value } = parsed;

    switch (name) {
      case 'UID':
        current.uid = value.trim();
        break;
      case 'SUMMARY':
        current.summary = unescape(value).trim();
        break;
      case 'DESCRIPTION':
        current.description = unescape(value).trim();
        break;
      case 'LOCATION':
        current.location = unescape(value).trim();
        break;
      case 'URL':
        current.url = value.trim();
        break;
      case 'DTSTART':
        current.start = parseDate(value, params);
        break;
      case 'DTEND':
        current.end = parseDate(value, params);
        break;
    }
  }

  return events;
}
