import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobCard from "./JobCard";
import type { Job } from "../lib/db";

const mockJob: Job = {
  id: 1,
  title: "Software Engineer",
  company: "Tech Corp",
  location: "San Francisco, CA",
  description: "We are looking for a software engineer to join our team.",
  apply_link: "https://example.com/apply",
  salary_range: "$100,000 - $120,000",
  job_type: "Full-time",
  posted_date: new Date().toISOString(),
};

describe("JobCard", () => {
  it("renders job information", () => {
    const handleClick = vi.fn();
    render(<JobCard job={mockJob} onClick={handleClick} />);

    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    expect(screen.getByText("$100,000 - $120,000")).toBeInTheDocument();
    expect(screen.getByText("Full-time")).toBeInTheDocument();
  });

  it("truncates long descriptions", () => {
    const longDescriptionJob: Job = {
      ...mockJob,
      description: "A".repeat(200),
    };
    const handleClick = vi.fn();
    render(<JobCard job={longDescriptionJob} onClick={handleClick} />);

    const description = screen.getByText(/^A+/);
    expect(description.textContent).toContain("...");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<JobCard job={mockJob} onClick={handleClick} />);

    const card = screen.getByRole("button");
    await user.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when Enter key is pressed", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<JobCard job={mockJob} onClick={handleClick} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when Space key is pressed", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<JobCard job={mockJob} onClick={handleClick} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard(" ");

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
