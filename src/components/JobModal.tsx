import type { Job } from "../lib/db";
import { useI18n } from "../i18n/context";

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobModal({ job, onClose }: JobModalProps) {
  const { t, locale } = useI18n();

  if (!job) return null;

  const translateSalaryRange = (salaryRange: string): string => {
    return salaryRange.replace(/\/hour/gi, t("perHour"));
  };

  const translateHourlyRate = (hourlyRate: string): string => {
    return hourlyRate.replace(/\/hour/gi, t("perHour"));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label={t("closeModal")}
        >
          ×
        </button>
        <h2>{job.title}</h2>
        <div className="job-details-header">
          <p className="company">{job.company}</p>
        </div>
        {job.hourly_rate && (
          <p className="hourly-rate">
            <strong>{t("hourlyRate")}</strong>{" "}
            {translateHourlyRate(job.hourly_rate)}
          </p>
        )}
        {job.salary_range && (
          <p className="salary-range">
            <strong>{t("salary")}</strong>{" "}
            {translateSalaryRange(job.salary_range)}
          </p>
        )}
        {job.job_type && (
          <p className="job-type-detail">
            <strong>{t("type")}</strong> {job.job_type}
          </p>
        )}
        <p className="posted-date">
          <strong>{t("posted")}</strong>{" "}
          {new Date(job.posted_date).toLocaleDateString(locale)}
        </p>
        <div className="job-description">
          <h3>{t("description")}</h3>
          <p>{job.description}</p>
          {job.description_url && (
            <a
              href={job.description_url}
              target="_blank"
              rel="noopener noreferrer"
              className="description-link"
            >
              {t("viewFullDescription")}
            </a>
          )}
        </div>
        {(job.contact_phone || job.contact_email) && (
          <div className="contact-info">
            <h3>{t("contact")}</h3>
            {job.contact_phone && (
              <p>
                <strong>{t("phone")}</strong>{" "}
                <a href={`tel:${job.contact_phone}`}>{job.contact_phone}</a>
              </p>
            )}
            {job.contact_email && (
              <p>
                <strong>{t("email")}</strong>{" "}
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
            {t("applyNow")}
          </a>
        )}
      </div>
    </div>
  );
}
