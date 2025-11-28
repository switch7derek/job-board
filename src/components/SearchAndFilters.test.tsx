import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchAndFilters from "./SearchAndFilters";

describe("SearchAndFilters", () => {
  const defaultProps = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    jobTypeFilter: "",
    onJobTypeChange: vi.fn(),
    availableJobTypes: ["Full-time", "Part-time", "Seasonal"],
  };

  it("renders search input and filter select", () => {
    render(<SearchAndFilters {...defaultProps} />);

    expect(screen.getByPlaceholderText(/Search jobs/)).toBeInTheDocument();
    expect(screen.getByText("All Job Types")).toBeInTheDocument();
  });

  it("displays current search query", () => {
    render(<SearchAndFilters {...defaultProps} searchQuery="server" />);

    const searchInput = screen.getByPlaceholderText(
      /Search jobs/,
    ) as HTMLInputElement;
    expect(searchInput.value).toBe("server");
  });

  it("calls onSearchChange when search input changes", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <SearchAndFilters {...defaultProps} onSearchChange={onSearchChange} />,
    );

    const searchInput = screen.getByPlaceholderText(/Search jobs/);
    await user.type(searchInput, "bartender");

    expect(onSearchChange).toHaveBeenCalled();
  });

  it("displays available job types in dropdown", () => {
    render(<SearchAndFilters {...defaultProps} />);

    const jobTypeSelect = screen.getByText("All Job Types").closest("select");
    expect(jobTypeSelect).toBeInTheDocument();

    const options = jobTypeSelect?.querySelectorAll("option");
    expect(options?.length).toBe(4); // All Job Types + 3 job types
  });

  it("calls onJobTypeChange when job type filter changes", async () => {
    const user = userEvent.setup();
    const onJobTypeChange = vi.fn();
    render(
      <SearchAndFilters {...defaultProps} onJobTypeChange={onJobTypeChange} />,
    );

    const jobTypeSelect = screen.getByText("All Job Types").closest("select");
    if (jobTypeSelect) {
      await user.selectOptions(jobTypeSelect, "Part-time");
      expect(onJobTypeChange).toHaveBeenCalledWith("Part-time");
    }
  });
});
