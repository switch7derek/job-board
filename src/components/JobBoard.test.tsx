import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobBoard from "./JobBoard";
import type { Job } from "../lib/db";

const mockJobs: Job[] = [
  {
    id: 1,
    title: "Server",
    company: "Downtown Bistro",
    location: "Local",
    description: "Server position at restaurant",
    apply_link: "https://example.com/1",
    job_type: "Full-time",
    posted_date: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Bartender",
    company: "The Local Pub",
    location: "Local",
    description: "Bartender position",
    apply_link: "https://example.com/2",
    job_type: "Part-time",
    posted_date: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Line Cook",
    company: "Family Restaurant",
    location: "Local",
    description: "Line cook position",
    apply_link: "https://example.com/3",
    job_type: "Full-time",
    posted_date: new Date().toISOString(),
  },
];

describe("JobBoard", () => {
  it("renders all jobs by default", () => {
    render(<JobBoard jobs={mockJobs} />);

    expect(screen.getByText("Server")).toBeInTheDocument();
    expect(screen.getByText("Bartender")).toBeInTheDocument();
    expect(screen.getByText("Line Cook")).toBeInTheDocument();
  });

  it("filters jobs by search query", async () => {
    const user = userEvent.setup();
    render(<JobBoard jobs={mockJobs} />);

    const searchInput = screen.getByPlaceholderText(/Search jobs/);
    await user.type(searchInput, "Server");

    expect(screen.getByText("Server")).toBeInTheDocument();
    expect(screen.queryByText("Bartender")).not.toBeInTheDocument();
    expect(screen.queryByText("Line Cook")).not.toBeInTheDocument();
  });

  it("filters jobs by job type", async () => {
    const user = userEvent.setup();
    render(<JobBoard jobs={mockJobs} />);

    const jobTypeSelect = screen.getByText("All Job Types").closest("select");
    if (jobTypeSelect) {
      await user.selectOptions(jobTypeSelect, "Part-time");

      expect(screen.queryByText("Server")).not.toBeInTheDocument();
      expect(screen.getByText("Bartender")).toBeInTheDocument();
      expect(screen.queryByText("Line Cook")).not.toBeInTheDocument();
    }
  });

  it("shows no jobs message when filters match nothing", async () => {
    const user = userEvent.setup();
    render(<JobBoard jobs={mockJobs} />);

    const searchInput = screen.getByPlaceholderText(/Search jobs/);
    await user.type(searchInput, "Nonexistent Job");

    expect(
      screen.getByText("No jobs found matching your criteria."),
    ).toBeInTheDocument();
  });

  it("opens modal when job card is clicked", async () => {
    const user = userEvent.setup();
    render(<JobBoard jobs={mockJobs} />);

    const serverCard = screen.getAllByText("Server")[0].closest(".job-card");
    if (serverCard) {
      await user.click(serverCard);

      // Check for modal-specific content
      expect(screen.getByText("Apply Now")).toBeInTheDocument();
      expect(screen.getByLabelText("Close modal")).toBeInTheDocument();
      // Verify modal has the job details
      const modal = screen.getByText("Apply Now").closest(".modal-content");
      expect(modal).toBeInTheDocument();
      expect(modal?.querySelector("h2")?.textContent).toBe("Server");
    }
  });
});
