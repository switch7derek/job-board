import type { Job } from "../lib/db";

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className="job-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h3>{job.title}</h3>
      <p className="company">{job.company}</p>
      <p className="location">{job.location}</p>
      {job.hourly_rate && <p className="hourly-rate">{job.hourly_rate}</p>}
      {job.job_type && <span className="job-type">{job.job_type}</span>}
      <p className="description-preview">
        {job.description.substring(0, 150)}
        {job.description.length > 150 ? "..." : ""}
      </p>
    </div>
  );
}
