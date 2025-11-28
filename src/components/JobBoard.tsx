import { useState, useMemo } from "react";
import type { Job } from "../lib/db";
import JobCard from "./JobCard";
import JobModal from "./JobModal";
import SearchAndFilters from "./SearchAndFilters";

interface JobBoardProps {
  jobs: Job[];
}

export default function JobBoard({ jobs }: JobBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const availableJobTypes = useMemo(() => {
    const types = new Set(
      jobs.filter((job) => job.job_type).map((job) => job.job_type!),
    );
    return Array.from(types).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesJobType = !jobTypeFilter || job.job_type === jobTypeFilter;

      return matchesSearch && matchesJobType;
    });
  }, [jobs, searchQuery, jobTypeFilter]);

  return (
    <div className="job-board">
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        jobTypeFilter={jobTypeFilter}
        onJobTypeChange={setJobTypeFilter}
        availableJobTypes={availableJobTypes}
      />
      <div className="jobs-grid">
        {filteredJobs.length === 0 ? (
          <p className="no-jobs">No jobs found matching your criteria.</p>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => setSelectedJob(job)}
            />
          ))
        )}
      </div>
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
