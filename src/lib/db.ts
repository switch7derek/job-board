import { readFileSync } from "fs";
import { join } from "path";

// Use process.cwd() for JSON file path to ensure it's in the project root
const jsonPath = join(process.cwd(), "jobboard.json");

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  apply_link: string;
  salary_range?: string;
  job_type?: string;
  posted_date: string;
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
  // Sort by posted_date descending
  return jobs.sort((a, b) => {
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

  // Sort by posted_date descending
  return filtered.sort((a, b) => {
    const dateA = new Date(a.posted_date).getTime();
    const dateB = new Date(b.posted_date).getTime();
    return dateB - dateA;
  });
}
