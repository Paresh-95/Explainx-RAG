//import { NextResponse } from "next/server";
//import prisma from "@repo/db/client";
//import { ReportType } from "@prisma/client";
//import { REPORT_CONFIGS, ReportConfig } from "../../../../types";
//import { auth } from "../../../../auth";
//const EU_API_ENDPOINT =
//  "https://advertising-api-eu.amazon.com/reporting/reports";
//const RETENTION_LIMITED_REPORTS = ["sbAds", "sbPlacements"];

//interface TokenResponse {
//  access_token: string;
//  token_type: string;
//  expires_in: number;
//  refresh_token: string;
//}

//// Function to refresh Amazon token
//async function refreshAmazonToken(refreshToken: string) {
//  const response = await fetch("https://api.amazon.com/auth/o2/token", {
//    method: "POST",
//    headers: {
//      "Content-Type": "application/x-www-form-urlencoded",
//    },
//    body: new URLSearchParams({
//      grant_type: "refresh_token",
//      refresh_token: refreshToken,
//      client_id: process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID!,
//      client_secret: process.env.AMAZON_CLIENT_SECRET!,
//    }),
//  });

//  if (!response.ok) {
//    throw new Error(`Failed to refresh token: ${response.statusText}`);
//  }

//  const data: TokenResponse = await response.json();

//  const expiresAt = new Date();
//  expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

//  return {
//    accessToken: data.access_token,
//    refreshToken: data.refresh_token,
//    expiresAt,
//  };
//}

//// Function to get and refresh tokens if needed
//async function getStoredTokens() {
//  const adAccount = await prisma.amazonAdAccount.findFirst({
//    where: {
//      isActive: true,
//    },
//  });

//  if (!adAccount) {
//    throw new Error("No active ad account found");
//  }

//  if (!adAccount.refreshToken) {
//    throw new Error("No refresh token available");
//  }

//  const expirationBuffer = 5 * 60 * 1000;
//  const tokenExpiresAt = adAccount.tokenExpiresAt;

//  if (
//    !tokenExpiresAt ||
//    tokenExpiresAt.getTime() - expirationBuffer < Date.now()
//  ) {
//    console.log("Token expired or expiring soon, refreshing...");
//    try {
//      const newTokens = await refreshAmazonToken(adAccount.refreshToken);

//      await prisma.amazonAdAccount.update({
//        where: { id: adAccount.id },
//        data: {
//          accessToken: newTokens.accessToken,
//          refreshToken: newTokens.refreshToken,
//          tokenExpiresAt: newTokens.expiresAt,
//        },
//      });

//      return newTokens.accessToken;
//    } catch (error) {
//      console.error("Failed to refresh token:", error);
//      throw new Error("Failed to refresh access token");
//    }
//  }

//  return adAccount.accessToken;
//}

//// Function to create a report request with Amazon API
//async function createReportRequest(
//  date: string,
//  profileId: string,
//  accessToken: string,
//  reportConfig: ReportConfig,
//  timeUnit: "DAILY" | "SUMMARY" = "DAILY",
//) {
//  const columns =
//    typeof reportConfig.columns === "function"
//      ? reportConfig.columns(timeUnit)
//      : reportConfig.columns;

//  const reportRequest = {
//    name: `${reportConfig.name} ${date}`,
//    startDate: date,
//    endDate: date,
//    configuration: {
//      adProduct: reportConfig.adProduct,
//      groupBy: reportConfig.groupBy,
//      columns: columns,
//      reportTypeId: reportConfig.reportTypeId,
//      timeUnit,
//      format: "GZIP_JSON",
//      ...(reportConfig.filters && { filters: reportConfig.filters }),
//    },
//  };

//  console.log(
//    `Creating report request for ${reportConfig.name}:`,
//    JSON.stringify(reportRequest, null, 2),
//  );

//  const response = await fetch(EU_API_ENDPOINT, {
//    method: "POST",
//    headers: {
//      "Content-Type": "application/vnd.createasyncreportrequest.v3+json",
//      "Amazon-Advertising-API-ClientId":
//        process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID!,
//      "Amazon-Advertising-API-Scope": profileId,
//      Authorization: `Bearer ${accessToken}`,
//    },
//    body: JSON.stringify(reportRequest),
//  });

//  const responseData = await response.json();

//  if (!response.ok) {
//    throw new Error(
//      `Failed to create report: ${response.status} ${response.statusText}. Details: ${JSON.stringify(responseData)}`,
//    );
//  }

//  console.log(`Amazon API response:`, responseData);

//  if (!responseData.reportId) {
//    throw new Error(
//      `No reportId received from Amazon API. Response: ${JSON.stringify(responseData)}`,
//    );
//  }

//  return responseData;
//}

//// Function to create report with metrics
//async function createReport(
//  profileId: string,
//  date: string,
//  accessToken: string,
//) {
//  const results: Record<string, any> = {};

//  for (const [reportKey, config] of Object.entries(REPORT_CONFIGS)) {
//    try {
//      // Handle retention limited reports
//      if (RETENTION_LIMITED_REPORTS.includes(reportKey)) {
//        const today = new Date();
//        const thirtyDaysAgo = new Date(today);
//        thirtyDaysAgo.setDate(today.getDate() - 30);

//        const limitedRange = thirtyDaysAgo.toISOString().split("T")[0];
//        console.log(
//          `Creating ${reportKey} report with limited range from ${limitedRange} to ${today.toISOString().split("T")[0]}`,
//        );

//        const amazonResponse = await createReportRequest(
//          //@ts-ignore
//          limitedRange,
//          profileId,
//          accessToken,
//          config,
//        );

//        // Create the report record in our database with Amazon's reportId
//        const report = await prisma.report.create({
//          data: {
//            name: `${config.name} ${date} (30-day retention)`,
//            profileId,
//            amazonReportId: amazonResponse.reportId,
//            status: "PENDING",
//            adProduct: config.adProduct,
//            startDate: thirtyDaysAgo,
//            endDate: today,
//            type: config.type,
//            [config.metricsModel]: {
//              create: [],
//            },
//          },
//        });

//        results[reportKey] = amazonResponse.reportId;
//        continue;
//      }

//      console.log(`Creating ${reportKey} report for date: ${date}`);
//      const amazonResponse = await createReportRequest(
//        date,
//        profileId,
//        accessToken,
//        config,
//      );

//      if (!amazonResponse.reportId) {
//        throw new Error(`No reportId received from Amazon for ${reportKey}`);
//      }

//      console.log(`Amazon report created with ID: ${amazonResponse.reportId}`);

//      // Create the report record in our database with Amazon's reportId
//      const report = await prisma.report.create({
//        data: {
//          name: `${config.name} ${date}`,
//          profileId,
//          amazonReportId: amazonResponse.reportId,
//          status: "PENDING",
//          adProduct: config.adProduct,
//          startDate: new Date(date),
//          endDate: new Date(date),
//          type: config.type,
//          [config.metricsModel]: {
//            create: [],
//          },
//        },
//      });

//      results[reportKey] = amazonResponse.reportId;
//    } catch (error) {
//      console.error(`Error creating ${reportKey} report:`, error);
//      throw error;
//    }
//  }

//  return results;
//}

//// API Key auth
//const apiKeyAuth = (request: Request) => {
//  console.log("Checking authorization...");
//  const authHeader = request.headers.get("authorization");
//  const hardcodedApiKey = "yash_j_thakker";

//  if (!authHeader) {
//    console.error("No authorization header");
//    return false;
//  }

//  return authHeader === `Bearer ${hardcodedApiKey}`;
//};

//export async function GET(request: Request) {
//  try {
//    const session = await auth();
//    if (!session) {
//      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//    }

//    if (!apiKeyAuth(request)) {
//      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//    }

//    console.log("Getting access token...");
//    const accessToken = await getStoredTokens();
//    if (!accessToken) {
//      throw new Error("Access token is null or undefined");
//    }
//    console.log("Token obtained successfully");

//    const yesterday = new Date();
//    yesterday.setDate(yesterday.getDate() - 1);
//    const yesterdayStr = yesterday.toISOString().split("T")[0];

//    console.log("Fetching active profiles...");

//    const activeProfiles = await prisma.profile.findMany({
//      where: {
//        isConnected: true,
//        status: "ACTIVE",
//      },
//      select: {
//        profileId: true,
//        reports: {
//          where: {
//            startDate: {
//              //@ts-ignore
//              equals: new Date(yesterdayStr),
//            },
//          },
//        },
//      },
//    });

//    console.log(`Found ${activeProfiles.length} active profiles`);

//    const profilesToUpdate: string[] = [];
//    const skippedProfiles: Record<string, string> = {};

//    for (const profile of activeProfiles) {
//      if (profile.reports.length === 0) {
//        profilesToUpdate.push(profile.profileId);
//      } else {
//        skippedProfiles[profile.profileId] =
//          "Data already exists for yesterday";
//      }
//    }

//    if (profilesToUpdate.length === 0) {
//      return NextResponse.json({
//        message: "No profiles require data fetch",
//        skippedProfiles,
//      });
//    }

//    console.log(`${profilesToUpdate.length} profiles need updating`);

//    const results = {
//      succeeded: [] as string[],
//      failed: {} as Record<string, string>,
//      reportIds: {} as Record<string, Record<string, string>>,
//    };

//    for (const profileId of profilesToUpdate) {
//      try {
//        const reportResults = await createReport(
//          profileId,
//          //@ts-ignore

//          yesterdayStr,
//          accessToken,
//        );
//        results.succeeded.push(profileId);
//        results.reportIds[profileId] = reportResults;
//      } catch (error) {
//        results.failed[profileId] =
//          error instanceof Error ? error.message : "Unknown error";
//      }
//    }

//    return NextResponse.json({
//      message: "Cron job completed",
//      updated: results.succeeded,
//      failed: results.failed,
//      skipped: skippedProfiles,
//      reportIds: results.reportIds,
//    });
//  } catch (error) {
//    console.error("Cron job error:", error);
//    return NextResponse.json(
//      {
//        message:
//          error instanceof Error ? error.message : "Failed to run cron job",
//        error: error instanceof Error ? error.stack : "Unknown error",
//      },
//      { status: 500 },
//    );
//  }
//}
