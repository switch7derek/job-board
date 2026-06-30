/**
 * Shared utilities for working with slt-jobs.csv across import-csv.ts
 * and check-links.ts. Keeps column definitions and validation logic
 * in one place so the two scripts can't drift out of sync.
 */

// Column order matches the no-header CSV layout used throughout the project.
// If a Status column is added, it is appended as a 10th column and is
// handled separately by check-links.ts (kept optional here so import-csv.ts,
// which doesn't care about Status, isn't forced to deal with it).
export const CSV_COLUMNS = [
  "Date Posted",
  "Company",
  "Job Title",
  "Application Link",
  "Type of work",
  "Hourly Rate",
  "Location",
  "Description",
  "Job Closes by",
] as const;

export type CsvRecord = Record<(typeof CSV_COLUMNS)[number], string> & {
  Status?: string;
};

/**
 * Check if a string is a valid http/https URL.
 * Shared with import-csv.ts, which uses this to decide whether the
 * "Application Link" column should be treated as a clickable link
 * or as free-text application instructions.
 */
export function isValidUrl(urlStr: string | undefined): boolean {
  if (!urlStr || urlStr.trim() === "") {
    return false;
  }
  try {
    const url = new URL(urlStr.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
