import Database from "better-sqlite3";
import { join } from "path";

// Use process.cwd() for database path to ensure it's in the project root
const dbPath = join(process.cwd(), "jobboard.db");
const db = new Database(dbPath);

// Create jobs table if it doesn't exist
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

export function getAllJobs(): Job[] {
  const stmt = db.prepare("SELECT * FROM jobs ORDER BY posted_date DESC");
  return stmt.all() as Job[];
}

export function getJobById(id: number): Job | undefined {
  const stmt = db.prepare("SELECT * FROM jobs WHERE id = ?");
  return stmt.get(id) as Job | undefined;
}

export function searchJobs(
  query: string,
  filters: {
    location?: string;
    jobType?: string;
  },
): Job[] {
  let sql = "SELECT * FROM jobs WHERE 1=1";
  const params: any[] = [];

  if (query) {
    sql += " AND (title LIKE ? OR company LIKE ? OR description LIKE ?)";
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.location) {
    sql += " AND location LIKE ?";
    params.push(`%${filters.location}%`);
  }

  if (filters.jobType) {
    sql += " AND job_type = ?";
    params.push(filters.jobType);
  }

  sql += " ORDER BY posted_date DESC";

  const stmt = db.prepare(sql);
  return stmt.all(...params) as Job[];
}


export default db;
