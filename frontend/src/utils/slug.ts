// Utility functions for generating and parsing slugs for recommendation filenames
// Slug format: <base-filename-without-ext>-<YYYYMMDDHHmmss>

export function generateSlug(filename: string, dateISO?: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  let stamp = '';
  if (dateISO) {
    const d = new Date(dateISO);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      stamp = `-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }
  }
  return slugify(`${base}${stamp}`);
}

export function parseSlug(slug: string): { filenameBase: string; timestamp?: string } {
  const match = slug.match(/^(.*?)-(\d{14})$/);
  if (match) {
    return { filenameBase: match[1], timestamp: match[2] };
  }
  return { filenameBase: slug };
}

export function matchSlugToFilename(slug: string, files: { name: string; date: string }[]): string | null {
  const { filenameBase, timestamp } = parseSlug(slug);
  // First attempt exact timestamp match
  if (timestamp) {
    const tsDate = tsToDate(timestamp);
    const exact = files.find(f => f.name.startsWith(filenameBase) && Math.abs(new Date(f.date).getTime() - tsDate.getTime()) < 5000);
    if (exact) return exact.name;
  }
  // Fallback: first file beginning with base
  const fallback = files.find(f => f.name.startsWith(filenameBase));
  return fallback ? fallback.name : null;
}

function tsToDate(ts: string): Date {
  const year = parseInt(ts.slice(0, 4));
  const month = parseInt(ts.slice(4, 6)) - 1;
  const day = parseInt(ts.slice(6, 8));
  const hour = parseInt(ts.slice(8, 10));
  const minute = parseInt(ts.slice(10, 12));
  const second = parseInt(ts.slice(12, 14));
  return new Date(year, month, day, hour, minute, second);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
