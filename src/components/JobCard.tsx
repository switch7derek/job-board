import type { Job } from "../lib/db";
import { useI18n } from "../i18n/context";

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const { t } = useI18n();

  const translateSalaryRange = (salaryRange: string): string => {
    return salaryRange.replace(/\/hour/gi, t("perHour"));
  };

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
      {job.salary_range && (
        <p className="salary">{translateSalaryRange(job.salary_range)}</p>
      )}
      {job.job_type && <span className="job-type">{job.job_type}</span>}
      <p className="description-preview">
        {job.description.substring(0, 150)}
        {job.description.length > 150 ? "..." : ""}
      </p>
    </div>
  );
}
