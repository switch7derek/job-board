import { describe, it, expect } from "vitest";
import { getAllJobs } from "../lib/db";

describe("index page", () => {
  it("can retrieve jobs from database", () => {
    const jobs = getAllJobs();
    expect(jobs).toBeInstanceOf(Array);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0]).toHaveProperty("id");
    expect(jobs[0]).toHaveProperty("title");
    expect(jobs[0]).toHaveProperty("company");
    expect(jobs[0]).toHaveProperty("location");
    expect(jobs[0]).toHaveProperty("description");
    // Jobs should have either apply_link or application_instructions
    expect(
      jobs[0].apply_link !== undefined ||
        jobs[0].application_instructions !== undefined,
    ).toBe(true);
  });
});
