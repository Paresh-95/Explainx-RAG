// ==========================================
// 6. QUEUE SERVICE - src/services/queueService.ts
// ==========================================
import Queue from "bull";
import Redis from "ioredis";
import { DocumentProcessor } from "./documentProcessor";
import { discordNotifier } from "./discordNotifier";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const documentProcessor = new DocumentProcessor();

// Create processing queue
const processingQueue = new Queue("document processing", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: "exponential",
      delay: 10000, // Start with 10 second delay
    },
  },
});

// Process jobs
processingQueue.process(10, async (job) => {
  // Process up to 10 jobs concurrently
  const data = job.data;

  // Update progress
  job.progress(0);

  try {
    await documentProcessor.processDocument(data);
    job.progress(100);
    return { success: true, studyMaterialId: data.studyMaterialId };
  } catch (error) {
    await discordNotifier.sendErrorNotification(error as Error, {
      operation: "queueJobProcess",
      studyMaterialId: data.studyMaterialId,
      jobId: job.id,
    });
    console.error("Job processing failed:", error);
    throw error;
  }
});

// Queue event handlers
processingQueue.on("completed", (job, result) => {
  console.log(
    `✅ Job ${job.id} completed for document ${result.studyMaterialId}`,
  );
});

processingQueue.on("failed", (job, err) => {
  discordNotifier.sendErrorNotification(err as Error, {
    operation: "queueJobFailed",
    jobId: job.id,
    errorMessage: err.message,
  });
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

processingQueue.on("stalled", (job) => {
  discordNotifier.sendErrorNotification(new Error("Job stalled"), {
    operation: "queueJobStalled",
    jobId: job.id,
  });
  console.warn(`⚠️ Job ${job.id} stalled`);
});

export const queueManager = {
  addProcessingJob: async (data: any, options?: any) => {
    return await processingQueue.add("process-document", data, {
      priority: options?.priority || 0,
      delay: options?.delay || 0,
      ...options,
    });
  },

  getJobStatus: async (jobId: string) => {
    const job = await processingQueue.getJob(jobId);
    return job
      ? {
          id: job.id,
          progress: job.progress(),
          state: await job.getState(),
          createdAt: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          failedReason: job.failedReason,
        }
      : null;
  },
};

export const setupQueue = () => {
  console.log("📋 Document processing queue initialized");
  return processingQueue;
};
