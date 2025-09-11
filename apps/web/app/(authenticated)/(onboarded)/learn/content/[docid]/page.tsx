import { auth } from "../../../../../../auth";
import prisma from "@repo/db";
import LearnClient from "../../../../../../components/learn/learn-client";
import { notFound } from "next/navigation";
import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer";

type Params = Promise<{
  docid: string;
}>;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface ContentPageProps {
  params: Params;
  searchParams?: SearchParams;
}

// Function to sign CloudFront URL
function signCloudFrontUrl(url: string): string {
  if (!url) return url;

  // Only sign if it's a CloudFront URL
  const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN!;

  if (!url.startsWith(cloudFrontDomain)) {
    return url; // Return unsigned if not a CloudFront URL
  }

  try {
    const signedUrl = getCloudFrontSignedUrl({
      keyPairId: process.env.AWS_CLOUDFRONT_KEYPAIR_ID!,
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY!,
      url: url,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60), // 1 hour expiry
    });

    return signedUrl;
  } catch (error) {
    console.error("Error signing CloudFront URL:", error);
    return url; // Return original URL if signing fails
  }
}

// Function to convert S3 URL to CloudFront URL and sign it
function convertToCloudFrontUrl(url: string | null): string | null {
  if (!url) return url;

  // CloudFront domain from environment
  const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN!;

  // Extract the key (path after bucket name) from S3 URL
  const s3Pattern = /https:\/\/[^\/]+\.s3\.[^\/]+\.amazonaws\.com\/(.+)/;
  const match = url.match(s3Pattern);

  let cloudFrontUrl = url;

  if (match && match[1]) {
    // Extract the key (everything after the bucket domain)
    const key = match[1];
    cloudFrontUrl = `${cloudFrontDomain}${key}`;
  }

  // Sign the CloudFront URL before returning
  return signCloudFrontUrl(cloudFrontUrl);
}

// Function to transform study material URLs
function transformStudyMaterialUrls(studyMaterial: any) {
  if (!studyMaterial) return studyMaterial;

  return {
    ...studyMaterial,
    fileUrl: convertToCloudFrontUrl(studyMaterial.fileUrl),
    recordingUrl: convertToCloudFrontUrl(studyMaterial.recordingUrl),
  };
}

// Function to transform all study materials in a space
function transformSpaceStudyMaterials(space: any) {
  if (!space || !space.studyMaterials) return space;

  return {
    ...space,
    studyMaterials: space.studyMaterials.map((material: any) =>
      transformStudyMaterialUrls(material),
    ),
  };
}

export default async function ContentPage(props: ContentPageProps) {
  const params = await props.params;
  const searchParams = props.searchParams
    ? await props.searchParams
    : undefined;

  const { docid } = params;
  const session = await auth();

  const recordParam = searchParams?.record;
  const tabParam = searchParams?.tab;

  if (recordParam || tabParam) {
    // Fetch the space by slug (from recordParam or tabParam)
    const spaceSlug = (recordParam || tabParam) as string;
    const space = await prisma.space.findUnique({
      where: { slug: spaceSlug },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        isPublic: true,
        visibility: true,
        ownerId: true,
        organizationId: true,
        settings: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        studyMaterials: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            docid: true,
            youtubeUrl: true,
            fileUrl: true,
            recordingUrl: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            duration: true,
            isProcessed: true,
            processingStatus: true,
            metadata: true,
            spaceId: true,
            uploadedById: true,
            createdAt: true,
            updatedAt: true,
            uploadedBy: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!space) notFound();

    // Check access as before
    const hasAccess =
      space.visibility === "PUBLIC" ||
      space.ownerId === session?.user?.id ||
      (space.organizationId &&
        session?.user?.organizations?.some(
          (org: any) => org.organizationId === space.organizationId,
        ));

    if (!hasAccess) notFound();

    // Transform URLs before passing to client (now includes signing)
    const transformedSpace = transformSpaceStudyMaterials(space);

    return (
      <div>
        <LearnClient
          studyMaterial={null}
          space={transformedSpace}
          session={session}
          spaceSlug={transformedSpace.slug}
          docid={docid}
          {...(recordParam
            ? { mode: "record" }
            : tabParam
              ? { mode: "tab" }
              : {})}
        />
      </div>
    );
  }

  try {
    // Fetch only the specific study material with essential relations
    const studyMaterial = await prisma.studyMaterial.findUnique({
      where: {
        docid: docid,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            isPublic: true,
            visibility: true,
            ownerId: true,
            organizationId: true,
            settings: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            studyMaterials: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                docid: true,
                youtubeUrl: true,
                fileUrl: true,
                recordingUrl: true,
                fileName: true,
                fileSize: true,
                mimeType: true,
                duration: true,
                isProcessed: true,
                processingStatus: true,
                metadata: true,
                spaceId: true,
                uploadedById: true,
                createdAt: true,
                updatedAt: true,
                uploadedBy: {
                  select: {
                    id: true,
                    username: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!studyMaterial) {
      notFound();
    }

    const space = studyMaterial.space;

    // Check access based on whether the material has a space or not
    let hasAccess = false;

    if (space) {
      // Material has a space - use space-based access control
      hasAccess =
        space.visibility === "PUBLIC" ||
        space.ownerId === session?.user?.id ||
        (space.organizationId &&
          session?.user?.organizations?.some(
            (org: any) => org.organizationId === space.organizationId,
          ));
    } else {
      // Material has no space - allow access to the uploader
      hasAccess = studyMaterial.uploadedById === session?.user?.id;
    }

    if (!hasAccess) {
      notFound();
    }

    // Transform URLs before passing to client (now includes signing)
    const transformedStudyMaterial = transformStudyMaterialUrls(studyMaterial);
    const transformedSpace = transformSpaceStudyMaterials(space);

    return (
      <div>
        <LearnClient
          studyMaterial={transformedStudyMaterial}
          space={transformedSpace}
          session={session}
          {...(recordParam
            ? { mode: "record" }
            : tabParam
              ? { mode: "tab" }
              : {})}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching study material:", error);
    notFound();
  }
}