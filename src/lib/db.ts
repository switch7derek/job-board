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
    apply_link TEXT,
    description_url TEXT,
    hourly_rate TEXT,
    salary_range TEXT,
    job_type TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    posted_date TEXT NOT NULL
  )
`);

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  apply_link?: string;
  description_url?: string;
  hourly_rate?: string;
  salary_range?: string;
  job_type?: string;
  contact_phone?: string;
  contact_email?: string;
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

// Seed data
const seedData: Omit<Job, "id">[] = [
  {
    title: "Server",
    company: "Downtown Bistro",
    location: "Local",
    description:
      "We are looking for an experienced server to join our restaurant team. You will take orders, serve food and beverages, and ensure excellent customer service. Previous restaurant experience preferred. Must be able to work evenings and weekends.",
    apply_link: "https://example.com/apply",
    salary_range: "$16 - $22/hour + tips",
    job_type: "Full-time",
    posted_date: new Date().toISOString(),
  },
  {
    title: "Bartender",
    company: "The Local Pub",
    location: "Local",
    description:
      "Join our bar team as a bartender. You will prepare and serve drinks, interact with customers, and maintain a clean bar area. Must have knowledge of cocktails and beer. Evening and weekend availability required.",
    apply_link: "https://example.com/jobs",
    salary_range: "$18 - $25/hour + tips",
    job_type: "Part-time",
    posted_date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    title: "Hotel Front Desk Agent",
    company: "City Center Hotel",
    location: "Local",
    description:
      "We are seeking a friendly and professional front desk agent for our hotel. You will check guests in and out, handle reservations, and assist with guest inquiries. Customer service experience preferred. Must be available for various shifts including nights and weekends.",
    apply_link: "https://example.com/careers",
    salary_range: "$17 - $20/hour",
    job_type: "Full-time",
    posted_date: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    title: "Housekeeping Staff",
    company: "Riverside Inn",
    location: "Local",
    description:
      "Looking for reliable housekeeping staff to maintain clean and comfortable guest rooms. You will clean rooms, restock supplies, and ensure high standards of cleanliness. No experience required, training provided. Must be able to work independently.",
    apply_link: "https://example.com/apply",
    salary_range: "$15 - $18/hour",
    job_type: "Full-time",
    posted_date: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    title: "Line Cook",
    company: "Family Restaurant",
    location: "Local",
    description:
      "We need an experienced line cook to join our kitchen team. You will prepare food according to recipes, maintain kitchen cleanliness, and work efficiently during busy service times. Previous kitchen experience required. Must be able to work in a fast-paced environment.",
    apply_link: "https://example.com/jobs",
    salary_range: "$16 - $20/hour",
    job_type: "Full-time",
    posted_date: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    title: "Event Server",
    company: "Catering Company",
    location: "Local",
    description:
      "Part-time event server position for weddings, corporate events, and parties. You will set up events, serve food and beverages, and clean up after events. Flexible schedule, mostly weekends. Must be able to lift 30+ pounds and stand for extended periods.",
    apply_link: "https://example.com/apply",
    salary_range: "$16 - $19/hour",
    job_type: "Part-time",
    posted_date: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    title: "Customer Service Representative",
    company: "Local Services Co",
    location: "Local",
    description:
      "Part-time customer service position. You will handle customer inquiries via phone and email. Flexible schedule available, perfect for students or those seeking part-time work.",
    apply_link: "https://example.com/apply",
    salary_range: "$18 - $22/hour",
    job_type: "Part-time",
    posted_date: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    title: "Lifeguard",
    company: "Community Pool",
    location: "Local",
    description:
      "Seasonal lifeguard position for community pool. You will monitor pool activities, enforce safety rules, and respond to emergencies. Must have current lifeguard certification. Position runs from Memorial Day through Labor Day. Perfect summer job!",
    apply_link: "https://example.com/summer-jobs",
    salary_range: "$17 - $20/hour",
    job_type: "Seasonal",
    posted_date: new Date(Date.now() - 604800000).toISOString(),
  },
];

// Check if database is empty and seed it
const countStmt = db.prepare("SELECT COUNT(*) as count FROM jobs");
const count = (countStmt.get() as { count: number }).count;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO jobs (title, company, location, description, apply_link, description_url, hourly_rate, salary_range, job_type, contact_phone, contact_email, posted_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((jobs) => {
    for (const job of jobs) {
      insert.run(
        job.title,
        job.company,
        job.location,
        job.description,
        job.apply_link || null,
        job.description_url || null,
        job.hourly_rate || null,
        job.salary_range || null,
        job.job_type || null,
        job.contact_phone || null,
        job.contact_email || null,
        job.posted_date,
      );
    }
  });

  insertMany(seedData);
}

export default db;
