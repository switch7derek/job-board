import type { Job } from "../lib/db";
import JobBoard from "./JobBoard";
import LanguageSwitcher from "./LanguageSwitcher";
import { I18nProvider } from "../i18n/context";
import type { Locale } from "../i18n/index";

interface JobBoardAppProps {
  jobs: Job[];
  initialLocale?: Locale;
}

export default function JobBoardApp({ jobs, initialLocale }: JobBoardAppProps) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      <LanguageSwitcher />
      <JobBoard jobs={jobs} />
    </I18nProvider>
  );
}
