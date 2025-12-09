import { readFileSync } from "fs";
import { join } from "path";

// Use process.cwd() for JSON file path to ensure it's in the project root
const jsonPath = join(process.cwd(), "jobboard.json");

// Sentinel date for unknown posted dates (epoch: 1970-01-01T00:00:00.000Z)
export const UNKNOWN_DATE = new Date(0).toISOString();

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  apply_link: string;
  hourly_rate?: string;
  job_type?: string;
  posted_date: string;
}

// Check if a date string represents an unknown date.
function isUnknownDate(dateStr: string): boolean {
  return dateStr === UNKNOWN_DATE;
}

function loadJobs(): Job[] {
  try {
    const content = readFileSync(jsonPath, "utf-8");
    return JSON.parse(content) as Job[];
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

export function getAllJobs(): Job[] {
  const jobs = loadJobs();
  // Sort by posted_date descending, with unknown dates at the end
  return jobs.sort((a, b) => {
    const isAUnknown = isUnknownDate(a.posted_date);
    const isBUnknown = isUnknownDate(b.posted_date);

    // Unknown dates go to the end
    if (isAUnknown && !isBUnknown) return 1;
    if (!isAUnknown && isBUnknown) return -1;
    if (isAUnknown && isBUnknown) return 0;

    const dateA = new Date(a.posted_date).getTime();
    const dateB = new Date(b.posted_date).getTime();
    return dateB - dateA;
  });
}

export function getJobById(id: number): Job | undefined {
  const jobs = loadJobs();
  return jobs.find((job) => job.id === id);
}

export function searchJobs(
  query: string,
  filters: {
    location?: string;
    jobType?: string;
  },
): Job[] {
  const jobs = loadJobs();
  let filtered = jobs;

  if (query) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm),
    );
  }

  if (filters.location) {
    const locationTerm = filters.location.toLowerCase();
    filtered = filtered.filter((job) =>
      job.location.toLowerCase().includes(locationTerm),
    );
  }

  if (filters.jobType) {
    filtered = filtered.filter((job) => job.job_type === filters.jobType);
  }

  // Sort by posted_date descending, with unknown dates at the end
  return filtered.sort((a, b) => {
    const isAUnknown = isUnknownDate(a.posted_date);
    const isBUnknown = isUnknownDate(b.posted_date);

    // Unknown dates go to the end
    if (isAUnknown && !isBUnknown) return 1;
    if (!isAUnknown && isBUnknown) return -1;
    if (isAUnknown && isBUnknown) return 0;

    const dateA = new Date(a.posted_date).getTime();
    const dateB = new Date(b.posted_date).getTime();
    return dateB - dateA;
  });
}
