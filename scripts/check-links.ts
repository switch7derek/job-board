/**
 * check-links.ts
 *
 * Reads slt-jobs.csv, checks the "Application Link" URL on every row that
 * has one, and writes a Status column (active / inactive / indeterminate)
 * back into the CSV. Rows whose Application Link is not a URL (plain-text
 * instructions, e.g. "Apply in person") are left with a blank Status and
 * are not checked.
 *
 * This script does NOT touch the Google Sheet. Status lives only in the
 * repo's slt-jobs.csv. It also does not run the Astro build — that's a
 * separate step in the GitHub Actions workflow, triggered after this
 * script commits its changes.
 *
 * Usage: yarn check-links   (see package.json)
 */

import { parse } from "csv-parse/sync";
import { stringify as stringifySync } from "csv-stringify/sync";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { CSV_COLUMNS, isValidUrl, type CsvRecord } from "./lib/csv-utils";

const csvPath = join(process.cwd(), "slt-jobs.csv");
const summaryPath = join(process.cwd(), "link-check-summary.json");

const REQUEST_TIMEOUT_MS = 10_000;
const DELAY_BETWEEN_REQUESTS_MS = 1_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; SLTMutualAidLinkChecker/1.0; +https://jobs.sltmutualaid.org)";

type LinkStatus = "active" | "inactive" | "indeterminate";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Some fields from the Google Sheets export contain embedded \r or \n
// characters even after trimming (e.g. a trailing newline just inside
// the closing quote). These helpers produce clean single-line versions
// for console output and for the summary file, without mutating the
// original field values that get written back to the CSV.
function companyLabelFor(record: CsvRecord): string {
  return record.Company?.replace(/[\r\n]+/g, " ").trim() ?? "";
}

function titleLabelFor(record: CsvRecord): string {
  return record["Job Title"]?.replace(/[\r\n]+/g, " ").trim() ?? "";
}

/**
 * Check a single URL and classify the result.
 *
 * - 2xx                          -> active
 * - 404, 410                     -> inactive
 * - DNS failure / connection refused -> inactive
 * - 401, 403                     -> indeterminate (likely a bot/auth wall, not proof the job is gone)
 * - timeout                      -> indeterminate
 * - 5xx                          -> indeterminate (likely transient)
 * - other redirects/responses    -> indeterminate (conservative default)
 */
async function checkUrl(url: string): Promise<LinkStatus> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return "active";
    }

    if (response.status === 404 || response.status === 410) {
      return "inactive";
    }

    if (response.status === 401 || response.status === 403) {
      return "indeterminate";
    }

    // 5xx and anything else unexpected: don't assume the job is gone.
    return "indeterminate";
  } catch (err: unknown) {
    // AbortError = timeout. Everything else here (ENOTFOUND, ECONNREFUSED,
    // certificate errors, etc.) means the site itself is unreachable.
    if (err instanceof Error && err.name === "AbortError") {
      return "indeterminate";
    }
    return "inactive";
  } finally {
    clearTimeout(timeoutId);
  }
}

async function main() {
  const ranAt = new Date().toISOString();

  console.log("Reading CSV file...");
  const csvContent = readFileSync(csvPath, "utf-8");

  console.log("Parsing CSV...");
  const records = parse(csvContent, {
    columns: [...CSV_COLUMNS, "Status"],
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    trim: true,
  }) as CsvRecord[];

  console.log(`Found ${records.length} job records`);

  const counts = {
    active: 0,
    inactive: 0,
    indeterminate: 0,
    skipped: 0,
  };

  const indeterminateJobs: Array<{
    company: string;
    title: string;
    link: string;
  }> = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const link = record["Application Link"]?.trim() ?? "";

    if (!isValidUrl(link)) {
      // Plain-text instructions, not a URL. Nothing to check.
      record.Status = "";
      counts.skipped++;
      console.log(
        `[${i + 1}/${records.length}] skipped       ${companyLabelFor(record)} — ${titleLabelFor(record)} (not a URL)`
      );
      continue;
    }

    const status = await checkUrl(link);
    record.Status = status;
    counts[status]++;

    if (status === "indeterminate") {
      indeterminateJobs.push({
        company: companyLabelFor(record),
        title: titleLabelFor(record),
        link,
      });
    }

    const companyLabel = companyLabelFor(record);
    const titleLabel = titleLabelFor(record);
    console.log(
      `[${i + 1}/${records.length}] ${status.padEnd(13)} ${companyLabel} — ${titleLabel}`
    );

    // Be polite to the sites we're checking.
    if (i < records.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log("Writing updated CSV...");
  const output = stringifySync(records, {
    columns: [...CSV_COLUMNS, "Status"],
    record_delimiter: "\n",
    quoted: true,
    quoted_empty: false,
  });
  writeFileSync(csvPath, output, "utf-8");

  const summary = {
    ranAt,
    active: counts.active,
    inactive: counts.inactive,
    indeterminate: counts.indeterminate,
    skipped: counts.skipped,
    total: records.length,
    indeterminateJobs,
  };
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
  console.log(`Wrote summary to ${summaryPath}`);

  console.log("\n--- Link Check Summary ---");
  console.log(`Active:        ${counts.active}`);
  console.log(`Inactive:      ${counts.inactive}`);
  console.log(`Indeterminate: ${counts.indeterminate}`);
  console.log(`Skipped (non-URL): ${counts.skipped}`);
  console.log(`Total:         ${records.length}`);
}

main().catch((err) => {
  console.error("Link checker failed:", err);
  process.exit(1);
});
