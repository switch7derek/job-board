import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobModal from "./JobModal";
import type { Job } from "../lib/db";
import { UNKNOWN_DATE } from "../lib/db";

const mockJob: Job = {
  id: 1,
  title: "Software Engineer",
  company: "Tech Corp",
  location: "San Francisco, CA",
  description: "We are looking for a software engineer to join our team.",
  apply_link: "https://example.com/apply",
  hourly_rate: "$100,000 - $120,000",
  job_type: "Full-time",
  posted_date: new Date().toISOString(),
};

describe("JobModal", () => {
  it("renders nothing when job is null", () => {
    const { container } = render(<JobModal job={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders job details when job is provided", () => {
    render(<JobModal job={mockJob} onClose={vi.fn()} />);

    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    expect(screen.getByText("$100,000 - $120,000")).toBeInTheDocument();
    expect(screen.getByText("Full-time")).toBeInTheDocument();
    expect(screen.getByText(/We are looking for/)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<JobModal job={mockJob} onClose={handleClose} />);

    const closeButton = screen.getByLabelText("Close modal");
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<JobModal job={mockJob} onClose={handleClose} />);

    const overlay = screen
      .getByText("Software Engineer")
      .closest(".modal-overlay");
    if (overlay) {
      await user.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it("does not call onClose when modal content is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<JobModal job={mockJob} onClose={handleClose} />);

    const content = screen.getByText("Software Engineer");
    await user.click(content);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it("renders apply link with correct href", () => {
    render(<JobModal job={mockJob} onClose={vi.fn()} />);

    const applyLink = screen.getByText("Apply Now");
    expect(applyLink).toHaveAttribute("href", "https://example.com/apply");
    expect(applyLink).toHaveAttribute("target", "_blank");
    expect(applyLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays 'Unknown' for jobs with unknown posted date", () => {
    const jobWithUnknownDate: Job = {
      ...mockJob,
      posted_date: UNKNOWN_DATE,
    };
    render(<JobModal job={jobWithUnknownDate} onClose={vi.fn()} />);

    expect(screen.getByText("Unknown")).toBeInTheDocument();
    const postedDateElement = screen.getByText(/Posted:/).closest("p");
    expect(postedDateElement?.textContent).toContain("Unknown");
  });
});
