# Job Board Web Application

A job board website built with Astro and React for browsing, searching, and filtering job postings.

## Setup

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Run the development server:
   ```bash
   yarn dev
   ```

3. Open [http://localhost:4321](http://localhost:4321) in your browser.

## Testing

Run tests:
```bash
yarn test
```

Run tests with UI:
```bash
yarn test:ui
```

## Data

The application uses a JSON file to store job data. The JSON file (`jobboard.json`) is populated from `slt-jobs.csv`. To import the CSV data into the JSON file, run:

```bash
yarn import-csv
```

This will replace any existing jobs and import all jobs from the CSV file.

## Build

Build for production:
```bash
yarn build
```

Preview production build:
```bash
yarn preview
```
