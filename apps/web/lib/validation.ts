// web/app/lib/validation.ts
import * as z from "zod";

export const SpaceVisibilitySchema = z.enum([
  "PRIVATE",
  "PUBLIC",
  "ORGANIZATION_ONLY",
]);
export const StudyMaterialTypeSchema = z.enum([
  "YOUTUBE_VIDEO",
  "PDF_DOCUMENT",
  "DOC_DOCUMENT",
  "AUDIO_RECORDING",
  "TEXT_NOTES",
  "OTHER",
]);

export const onboardingSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(50, "Organization name must be less than 50 characters"),
  organizationSlug: z
    .string()
    .min(2, "URL must be at least 2 characters")
    .max(30, "URL must be less than 30 characters")
    .regex(
      /^[a-z0-9\-]+$/,
      "URL can only contain lowercase letters, numbers, and hyphens",
    ),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(15, "Username must be less than 15 characters"),
});

// Helper function to validate YouTube URL
const isValidYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check for valid YouTube domains
    const validDomains = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "www.youtu.be",
    ];

    if (!validDomains.includes(hostname)) {
      return false;
    }

    // Handle youtu.be short URLs
    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      const videoId = urlObj.pathname.slice(1); // Remove leading slash
      return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
    }

    // Handle youtube.com URLs
    if (hostname.includes("youtube.com")) {
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      // Standard watch URLs
      if (pathname === "/watch") {
        const videoId = searchParams.get("v");
        return videoId !== null && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      }

      // Embed URLs
      if (pathname.startsWith("/embed/")) {
        const videoId = pathname.slice(7); // Remove '/embed/'
        return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      }

      // Shorts URLs
      if (pathname.startsWith("/shorts/")) {
        const videoId = pathname.slice(8); // Remove '/shorts/'
        return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      }

      // Live URLs
      if (pathname === "/live") {
        const videoId = searchParams.get("v");
        return videoId !== null && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      }
    }

    return false;
  } catch {
    // Invalid URL format
    return false;
  }
};

// Alternative regex-only version (more permissive but simpler)
const isValidYouTubeUrlRegex = (url: string): boolean => {
  const youtubeRegex =
    /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/|live\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
  return youtubeRegex.test(url);
};

// Base space validation
export const BaseSpaceSchema = z.object({
  name: z
    .string()
    .min(1, "Space name is required")
    .max(100, "Space name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, "Space name contains invalid characters"),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  isPublic: z.boolean().default(false),

  visibility: SpaceVisibilitySchema.default("PRIVATE"),

  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .default([]),
});

// YouTube URL validation
export const YouTubeSpaceSchema = BaseSpaceSchema.extend({
  youtubeUrl: z
    .string()
    .min(1, "YouTube URL is required")
    .url("Please enter a valid URL")
    .refine(isValidYouTubeUrl, {
      message: "Please enter a valid YouTube URL",
    }),

  // Ensure other fields are not present for YouTube spaces
  fileUrl: z.undefined().optional(),
  fileName: z.undefined().optional(),
  fileSize: z.undefined().optional(),
  mimeType: z.undefined().optional(),
});

// File upload validation
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FileUploadSpaceSchema = BaseSpaceSchema.extend({
  fileUrl: z.string().url("Invalid file URL").min(1, "File URL is required"),

  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name too long"),

  fileSize: z
    .number()
    .int("File size must be an integer")
    .min(1, "File size must be greater than 0")
    .max(
      MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    ),

  mimeType: z.string().refine((type) => ALLOWED_FILE_TYPES.includes(type), {
    message: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
  }),

  // Ensure YouTube fields are not present for file uploads
  youtubeUrl: z.undefined().optional(),
});

// Recording validation (for future use)
export const RecordingSpaceSchema = BaseSpaceSchema.extend({
  recordingUrl: z
    .string()
    .url("Invalid recording URL")
    .min(1, "Recording URL is required"),

  duration: z
    .number()
    .int("Duration must be an integer")
    .min(1, "Duration must be greater than 0")
    .max(3600, "Recording must be less than 1 hour")
    .optional(),

  // Ensure other fields are not present
  youtubeUrl: z.undefined().optional(),
  fileUrl: z.undefined().optional(),
  fileName: z.undefined().optional(),
  fileSize: z.undefined().optional(),
  mimeType: z.undefined().optional(),
});

// Union type for create space validation
export const CreateSpaceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("youtube"),
    ...YouTubeSpaceSchema.shape,
  }),
  z.object({
    type: z.literal("file"),
    ...FileUploadSpaceSchema.shape,
  }),
  z.object({
    type: z.literal("recording"),
    ...RecordingSpaceSchema.shape,
  }),
]);

// Update space validation (for PATCH requests)
export const UpdateSpaceSchema = z.object({
  name: z
    .string()
    .min(1, "Space name is required")
    .max(100, "Space name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, "Space name contains invalid characters")
    .optional(),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),

  isPublic: z.boolean().optional(),

  visibility: SpaceVisibilitySchema.optional(),

  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .optional(),

  settings: z.record(z.any()).optional(),
});

// Study material validation
export const StudyMaterialSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),

    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .or(z.literal("")),

    type: StudyMaterialTypeSchema,

    // Optional fields based on type
    youtubeUrl: z
      .string()
      .url("Invalid YouTube URL")
      .refine(isValidYouTubeUrl, "Please enter a valid YouTube URL")
      .optional(),

    fileUrl: z.string().url("Invalid file URL").optional(),

    recordingUrl: z.string().url("Invalid recording URL").optional(),

    fileName: z.string().max(255, "File name too long").optional(),

    fileSize: z
      .number()
      .int("File size must be an integer")
      .min(0)
      .max(MAX_FILE_SIZE)
      .optional(),

    mimeType: z.string().optional(),

    duration: z.number().int("Duration must be an integer").min(0).optional(),

    metadata: z.record(z.any()).optional(),
  })
  .refine(
    (data) => {
      // Type-specific validation
      if (data.type === "YOUTUBE_VIDEO") {
        return !!data.youtubeUrl;
      }
      if (data.type === "PDF_DOCUMENT" || data.type === "DOC_DOCUMENT") {
        return !!data.fileUrl && !!data.fileName;
      }
      if (data.type === "AUDIO_RECORDING") {
        return !!data.recordingUrl;
      }
      return true;
    },
    {
      message: "Missing required fields for the selected material type",
    },
  );

// Query parameter validation - FIXED
export const SpaceQuerySchema = z.object({
  userId: z.string().cuid().optional(),
  isPublic: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  visibility: SpaceVisibilitySchema.optional(),
  page: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1))
    .optional()
    .default("1")
    .transform((val) => (typeof val === "string" ? parseInt(val) : val)),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default("10")
    .transform((val) => (typeof val === "string" ? parseInt(val) : val)),
});

// Slug validation
export const SlugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug too long");

// Username validation
export const UsernameSchema = z
  .string()
  .min(1, "Username is required")
  .max(50, "Username too long")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens",
  );

// Space access validation
export const SpaceAccessSchema = z.object({
  username: UsernameSchema,
  slug: SlugSchema,
});

// Client-side form validation (for the modal) - FIXED
export const ClientSpaceFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Space name is required")
      .max(100, "Space name must be less than 100 characters"),

    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .or(z.literal("")),

    isPublic: z.boolean().default(false),

    method: z.enum(["upload", "paste", "record"]),

    // Conditional fields - FIXED: Use superRefine for complex validation
    youtubeUrl: z.string().optional(),
    file: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    // YouTube URL validation for paste method
    if (data.method === "paste") {
      if (!data.youtubeUrl || data.youtubeUrl.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "YouTube URL is required",
          path: ["youtubeUrl"],
        });
      } else if (!isValidYouTubeUrl(data.youtubeUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid YouTube URL",
          path: ["youtubeUrl"],
        });
      }
    }

    // File validation for upload method
    if (data.method === "upload") {
      if (!data.file) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a file to upload",
          path: ["file"],
        });
      } else {
        if (data.file.size > MAX_FILE_SIZE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            path: ["file"],
          });
        }
        if (!ALLOWED_FILE_TYPES.includes(data.file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "File type not allowed",
            path: ["file"],
          });
        }
      }
    }
  });

// Type exports
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type CreateSpaceInput = z.infer<typeof CreateSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof UpdateSpaceSchema>;
export type StudyMaterialInput = z.infer<typeof StudyMaterialSchema>;
export type SpaceQueryInput = z.infer<typeof SpaceQuerySchema>;
export type SpaceAccessInput = z.infer<typeof SpaceAccessSchema>;
export type ClientSpaceFormInput = z.infer<typeof ClientSpaceFormSchema>;

// Helper function to validate space creation based on method
export const validateSpaceCreation = (
  data: any,
  method: "upload" | "paste" | "record",
) => {
  switch (method) {
    case "paste":
      return CreateSpaceSchema.parse({ ...data, type: "youtube" });
    case "upload":
      return CreateSpaceSchema.parse({ ...data, type: "file" });
    case "record":
      return CreateSpaceSchema.parse({ ...data, type: "recording" });
    default:
      throw new Error("Invalid creation method");
  }
};
