import { CronJob } from "cron";
import { createRetryFailedReportsHandler } from "../services/retry-report";

const retryJob = new CronJob(
  "0 */4 * * *", // Run every 4 hours
  createRetryFailedReportsHandler(),
  null,
  true,
  "UTC",
);
