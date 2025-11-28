import { useI18n } from "../i18n/context";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  jobTypeFilter: string;
  onJobTypeChange: (jobType: string) => void;
  availableJobTypes: string[];
}

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  jobTypeFilter,
  onJobTypeChange,
  availableJobTypes,
}: SearchAndFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="search-and-filters">
      <div className="search-box">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="filters">
        <select
          value={jobTypeFilter}
          onChange={(e) => onJobTypeChange(e.target.value)}
          className="filter-select"
        >
          <option value="">{t("allJobTypes")}</option>
          {availableJobTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
