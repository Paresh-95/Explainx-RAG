import { processDailyReports } from "../services/daily-report";
import { logger } from "../services/reports/logger";
import { CronJob } from "cron";

const CRON_NAME = "daily-reports-fetch";
const MAX_RETRIES = 3;
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Wrapper function to handle retries
async function handleDailyReportsWithRetry() {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      await processDailyReports();
      return; // Success, exit the function
    } catch (error) {
      attempts++;

      await logger.error(
        CRON_NAME,
        `Failed attempt ${attempts} of ${MAX_RETRIES}`,
        {
          attempt: attempts,
          error,
          maxRetries: MAX_RETRIES,
        },
      );

      if (attempts < MAX_RETRIES) {
        await logger.info(
          CRON_NAME,
          `Retrying in ${RETRY_DELAY / 1000} seconds...`,
          {
            nextRetryIn: RETRY_DELAY,
          },
        );

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        await logger.error(CRON_NAME, "Max retries reached, giving up", {
          error,
        });
        throw error;
      }
    }
  }
}

// Create the cron job handler
const createDailyReportsHandler = () => {
  return async () => {
    await logger.info(CRON_NAME, "Starting scheduled daily reports job");

    try {
      await handleDailyReportsWithRetry();
      await logger.info(CRON_NAME, "Daily reports job completed successfully");
    } catch (error) {
      await logger.error(
        CRON_NAME,
        "Daily reports job failed after all retries",
        { error },
      );
    }
  };
};

// Create a function to create cron job
const createCronJob = (cronTime: string, onTick: () => Promise<void>) => {
  return new CronJob(
    cronTime,
    onTick,
    null, // onComplete
    true, // start
    "UTC", // timezone
  );
};

// Create cron jobs store
const cronJobs = {
  [CRON_NAME]: createCronJob("0 1 * * *", createDailyReportsHandler()),
};

// Function to start all cron jobs
export async function startCronJobs() {
  Object.values(cronJobs).forEach((job) => {
    if (!job.running) {
      job.start();
    }
  });

  await logger.info(CRON_NAME, "All cron jobs started");
}

// Function to stop all cron jobs
export async function stopCronJobs() {
  Object.values(cronJobs).forEach((job) => {
    if (job.running) {
      job.stop();
    }
  });

  await logger.info(CRON_NAME, "All cron jobs stopped");
}

// Export jobs for testing
export const getCronJobs = () => cronJobs;
