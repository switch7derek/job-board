import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";
import type { Job } from "../src/lib/db";

const dbPath = join(process.cwd(), "jobboard.db");
const csvPath = join(process.cwd(), "slt-jobs.csv");

// Parse date from MM/DD/YYYY format to ISO string
function parseDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr.trim() === "") {
    return new Date().toISOString();
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

function importCsvToDb() {
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

  const db = new Database(dbPath);

  // Create table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      apply_link TEXT NOT NULL,
      salary_range TEXT,
      job_type TEXT,
      posted_date TEXT NOT NULL
    )
  `);

  // Clear existing data
  console.log("Clearing existing jobs...");
  db.exec("DELETE FROM jobs");

  // Prepare insert statement
  const insert = db.prepare(`
    INSERT INTO jobs (title, company, location, description, apply_link, salary_range, job_type, posted_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((jobs: Omit<Job, "id">[]) => {
    for (const job of jobs) {
      insert.run(
        job.title,
        job.company,
        job.location,
        job.description,
        job.apply_link,
        job.salary_range || null,
        job.job_type || null,
        job.posted_date,
      );
    }
  });

  // Map CSV records to Job format and filter out invalid records
  const jobs: Omit<Job, "id">[] = records
    .map((record) => {
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
        salary_range: record["Hourly Rate"]?.trim() || undefined,
        job_type: record["Type of work"]?.trim() || undefined,
        posted_date: parseDate(record["Date Posted"]),
      };
    })
    .filter((job): job is Omit<Job, "id"> => job !== null);

  console.log("Inserting jobs into database...");
  insertMany(jobs);

  const countStmt = db.prepare("SELECT COUNT(*) as count FROM jobs");
  const count = (countStmt.get() as { count: number }).count;
  console.log(`Successfully imported ${count} jobs`);

  db.close();
}

importCsvToDb();

