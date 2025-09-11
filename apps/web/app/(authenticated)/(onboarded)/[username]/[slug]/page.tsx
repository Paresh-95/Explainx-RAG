// File: app/[username]/[slug]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "../../../../../auth";
import prisma from "@repo/db";

import { cookies } from "next/headers";
import { Suspense } from "react";
import SpaceClientSkeleton from "../../../../../components/space/SpaceClientSkeleton";
import SpacePublicClient from "../../../../../components/space/SpacePublicClient";

type Params = Promise<{
  username: string;
  slug: string;
}>;

interface SpacePageProps {

  params: Params;
}

async function SpaceContent({ slug }: { slug: string }) {
  const session = await auth();
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  // Fetch space data from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/spaces/${slug}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieString,
      },
    },
  );

  if (!response.ok) {
    console.error(
      `Failed to fetch space: ${response.status} ${response.statusText}`,
    );

    if (response.status === 404) {
      notFound();
    }

    if (response.status === 403) {
      const errorData = await response.json();

      // Check if this is a private space that the user might be able to join
      if (errorData.code === "ACCESS_DENIED") {
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Private Space
              </h1>
              <p className="text-gray-600 mb-6">
                This space is private and cannot be accessed.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => (window.location.href = "/spaces")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Browse Public Spaces
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    const errorText = await response.text();
    console.error("Error details:", errorText);

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Space
          </h1>
          <p className="text-gray-600">
            There was an error loading this space. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const space = await response.json();

  // The access control is now handled in the API, so if we get here,
  // the user has permission to view the space
  return <SpacePublicClient space={space} session={session} />;
}


export default async function SpacePage({ params }: SpacePageProps) {
  // Await the params first
  const { username, slug } = await params;

  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    notFound();
  }

  // Find space by slug and owner
  const space = await prisma.space.findFirst({
    where: {
      slug,
      ownerId: user.id,
    },
    include: {
      studyMaterials: true,
      owner: {
        select: {
          username: true,
          name: true,
        },
      },
    },
  });

  if (!space) {
    notFound();
  }

  // Check access permissions
  const isOwner = session?.user?.id === space.ownerId;
  const canAccess = space.isPublic || isOwner;

  if (!canAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Private Space
          </h1>
          <p className="text-gray-600">
            This space is private and cannot be accessed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<SpaceClientSkeleton />}>
      <SpaceContent slug={slug} />
    </Suspense>
  );
}
