import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Job } from "../src/lib/db";

const jsonPath = join(process.cwd(), "jobboard.json");
const csvPath = join(process.cwd(), "slt-jobs.csv");

// Sentinel date for unknown posted dates (epoch: 1970-01-01T00:00:00.000Z)
const UNKNOWN_DATE = new Date(0).toISOString();

// Parse date from MM/DD/YYYY format to ISO string
function parseDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr.trim() === "") {
    return UNKNOWN_DATE;
  }

  // Check for "Unknown" (case-insensitive)
  if (dateStr.trim().toLowerCase() === "unknown") {
    return UNKNOWN_DATE;
  }

  const parts = dateStr.trim().split("/");
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toISOString();
  }

  return new Date().toISOString();
}

function importCsvToJson() {
  console.log("Reading CSV file...");
  const csvContent = readFileSync(csvPath, "utf-8");

  console.log("Parsing CSV...");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    trim: true,
  }) as Array<{
    "Date Posted": string;
    Company: string;
    "Job Title": string;
    "Application Link": string;
    "Type of work": string;
    "Hourly Rate": string;
    Location: string;
    Description: string;
  }>;

  console.log(`Found ${records.length} job records`);

  // Map CSV records to Job format and filter out invalid records
  const jobsWithoutIds = records
    .map((record): Omit<Job, "id"> | null => {
      const title = record["Job Title"]?.trim() || "";
      const company = record.Company?.trim() || "";
      const location = record.Location?.trim() || "";
      const description = record.Description?.trim() || "";
      const apply_link = record["Application Link"]?.trim() || "";

      // Skip records missing required fields
      if (!title || !company || !location || !description || !apply_link) {
        return null;
      }

      return {
        title,
        company,
        location,
        description,
        apply_link,
        hourly_rate: record["Hourly Rate"]?.trim() || undefined,
        job_type: record["Type of work"]?.trim() || undefined,
        posted_date: parseDate(record["Date Posted"]),
      };
    })
    .filter((job): job is Omit<Job, "id"> => job !== null);

  // Assign sequential IDs starting from 1
  const jobs: Job[] = jobsWithoutIds.map((job, index) => ({
    ...job,
    id: index + 1,
  }));

  console.log("Writing jobs to JSON file...");
  writeFileSync(jsonPath, JSON.stringify(jobs, null, 2), "utf-8");

  console.log(`Successfully imported ${jobs.length} jobs`);
}

importCsvToJson();

