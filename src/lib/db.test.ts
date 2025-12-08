import { describe, it, expect } from "vitest";
import { UNKNOWN_DATE, isUnknownDate, getAllJobs, searchJobs } from "./db";
import type { Job } from "./db";

describe("db", () => {
  describe("isUnknownDate", () => {
    it("returns true for UNKNOWN_DATE", () => {
      expect(isUnknownDate(UNKNOWN_DATE)).toBe(true);
    });

    it("returns false for regular dates", () => {
      expect(isUnknownDate(new Date().toISOString())).toBe(false);
      expect(isUnknownDate("2024-01-15T00:00:00.000Z")).toBe(false);
    });
  });

  describe("getAllJobs sorting with unknown dates", () => {
    it("sorts jobs with unknown dates at the end", () => {
      // This test depends on the actual jobboard.json file
      // If the file doesn't exist or has no jobs, the test will still pass
      // but won't verify the sorting behavior
      const jobs = getAllJobs();
      
      if (jobs.length === 0) {
        // Skip test if no jobs available
        return;
      }

      // Find the first unknown date job and the last known date job
      let firstUnknownIndex = -1;
      let lastKnownIndex = -1;

      for (let i = 0; i < jobs.length; i++) {
        if (isUnknownDate(jobs[i].posted_date)) {
          if (firstUnknownIndex === -1) {
            firstUnknownIndex = i;
          }
        } else {
          lastKnownIndex = i;
        }
      }

      // If there are unknown dates, they should come after all known dates
      if (firstUnknownIndex !== -1 && lastKnownIndex !== -1) {
        expect(firstUnknownIndex).toBeGreaterThan(lastKnownIndex);
      }
    });
  });

  describe("searchJobs sorting with unknown dates", () => {
    it("sorts filtered jobs with unknown dates at the end", () => {
      const jobs = searchJobs("", {});
      
      if (jobs.length === 0) {
        // Skip test if no jobs available
        return;
      }

      // Find the first unknown date job and the last known date job
      let firstUnknownIndex = -1;
      let lastKnownIndex = -1;

      for (let i = 0; i < jobs.length; i++) {
        if (isUnknownDate(jobs[i].posted_date)) {
          if (firstUnknownIndex === -1) {
            firstUnknownIndex = i;
          }
        } else {
          lastKnownIndex = i;
        }
      }

      // If there are unknown dates, they should come after all known dates
      if (firstUnknownIndex !== -1 && lastKnownIndex !== -1) {
        expect(firstUnknownIndex).toBeGreaterThan(lastKnownIndex);
      }
    });
  });
});

