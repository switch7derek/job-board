import type { Job } from "../lib/db";

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobModal({ job, onClose }: JobModalProps) {
  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2>{job.title}</h2>
        <div className="job-details-header">
          <p className="company">{job.company}</p>
        </div>
        {job.hourly_rate && (
          <p className="hourly-rate">
            <strong>Hourly Rate:</strong> {job.hourly_rate}
          </p>
        )}
        {job.salary_range && (
          <p className="salary-range">
            <strong>Salary:</strong> {job.salary_range}
          </p>
        )}
        {job.job_type && (
          <p className="job-type-detail">
            <strong>Type:</strong> {job.job_type}
          </p>
        )}
        <p className="posted-date">
          <strong>Posted:</strong>{" "}
          {new Date(job.posted_date).toLocaleDateString()}
        </p>
        <div className="job-description">
          <h3>Description</h3>
          <p>{job.description}</p>
          {job.description_url && (
            <a
              href={job.description_url}
              target="_blank"
              rel="noopener noreferrer"
              className="description-link"
            >
              View Full Job Description
            </a>
          )}
        </div>
        {(job.contact_phone || job.contact_email) && (
          <div className="contact-info">
            <h3>Contact</h3>
            {job.contact_phone && (
              <p>
                <strong>Phone:</strong>{" "}
                <a href={`tel:${job.contact_phone}`}>{job.contact_phone}</a>
              </p>
            )}
            {job.contact_email && (
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${job.contact_email}`}>{job.contact_email}</a>
              </p>
            )}
          </div>
        )}
        {job.apply_link && (
          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="apply-button"
          >
            Apply Now
          </a>
        )}
      </div>
    </div>
  );
}
