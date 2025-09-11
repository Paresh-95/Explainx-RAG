"use client";
// app/spaces/discover/page.tsx
import { Suspense } from "react";
import { Globe, Users, Calendar, Search } from "lucide-react";
import { redirect } from "next/navigation";

import prisma from "@repo/db";
import SpaceMembershipButton from "../space/SpaceMembershipButton";
import { auth } from "../../auth";
interface PublicSpace {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  visibility: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
  organization: {
    id: string;
    name: string;
  } | null;
  _count: {
    memberships: number;
    studyMaterials: number;
  };
  userMembership?: {
    id: string;
    role: string;
    status: string;
  } | null;
}

async function getPublicSpaces(userId?: string): Promise<PublicSpace[]> {
  const spaces = await prisma.space.findMany({
    where: {
      OR: [{ isPublic: true }, { visibility: "PUBLIC" }],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          memberships: true,
          studyMaterials: true,
        },
      },
      ...(userId && {
        memberships: {
          where: {
            userId: userId,
            status: "ACTIVE",
          },
          select: {
            id: true,
            role: true,
            status: true,
          },
        },
      }),
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return spaces.map((space) => ({
    ...space,
    userMembership: (userId && space.memberships?.[0]) || null,
  })) as PublicSpace[];
}

function getSpacePermissions(space: PublicSpace, currentUserId?: string) {
  const isOwner = space.owner.id === currentUserId;
  const isMember = !!space.userMembership;
  const canJoin = !!currentUserId && !isMember && !isOwner;
  const canLeave = !!currentUserId && isMember && !isOwner;

  return {
    canJoin,
    canLeave,
    isOwner,
    isMember,
    userRole: isOwner ? "OWNER" : space.userMembership?.role,
  };
}

function SpaceCard({
  space,
  currentUserId,
}: {
  space: PublicSpace;
  currentUserId?: string;
}) {
  const permissions = getSpacePermissions(space, currentUserId);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-200 group relative overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-2xl font-semibold text-black dark:text-white tracking-tight leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {space.name}
          </h3>
          <Globe className="h-4 w-4 text-blue-400 dark:text-blue-500 opacity-70" />
        </div>
        {space.description && (
          <p className="text-gray-500 dark:text-gray-400 text-base mb-2 line-clamp-2 font-normal">
            {space.description}
          </p>
        )}
        <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 opacity-60" />
            <span>{space._count.memberships} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 opacity-60" />
            <span>Created {new Date(space.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center shadow-sm">
              {space.owner.image ? (
                <img
                  src={space.owner.image}
                  alt={space.owner.name || "Owner"}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs text-black dark:text-white font-semibold">
                  {space.owner.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              by {space.owner.name || space.owner.username || "Anonymous"}
            </span>
          </div>
          {space.organization && (
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-medium border border-zinc-200 dark:border-zinc-700">
              {space.organization.name}
            </span>
          )}
        </div>
        {space.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {space.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium border border-blue-100 dark:border-blue-900"
              >
                {tag}
              </span>
            ))}
            {space.tags.length > 3 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                +{space.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">
          {space._count.studyMaterials} study materials
        </div>
      </div>
      <div className="flex justify-between items-center mt-6">
        <a
          href={`/spaces/${space.slug}`}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold transition-colors"
        >
          View Space →
        </a>
        <SpaceMembershipButton
          spaceSlug={space.slug}
          permissions={{
            canJoin: permissions.canJoin,
            canLeave: permissions.canLeave,
          }}
          userRole={permissions.userRole}
        />
      </div>
    </div>
  );
}

function SearchAndFilter() {
  return (
    <div className="mb-10">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search public spaces..."
          className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none shadow-sm"
        />
      </div>
    </div>
  );
}

function LoadingSpaces() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-md animate-pulse"
        >
          <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded mb-3"></div>
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded mb-2"></div>
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-16"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-20"></div>
          </div>
          <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
        </div>
      ))}
    </div>
  );
}

async function PublicSpacesList() {
  const session = await auth();
  const spaces = await getPublicSpaces(session?.user?.id);

  if (spaces.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Public Spaces Yet
        </h3>
        <p className="text-gray-400 mb-6">
          Be the first to create a public space that others can discover and
          join!
        </p>
        <a
          href="/spaces/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Create Public Space
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spaces.map((space) => (
        <SpaceCard
          key={space.id}
          space={space}
          currentUserId={session?.user?.id}
        />
      ))}
    </div>
  );
}

export default async function DiscoverSpacesPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?callbackUrl=/spaces/discover");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-blue-500 opacity-80" />
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">Discover Public Spaces</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-normal">
            Explore and join public learning spaces created by the community
          </p>
        </div>
        {/* Search and Filters */}
        <SearchAndFilter />
        {/* Navigation breadcrumbs */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              My Spaces
            </a>
            <span>•</span>
            <span className="text-black dark:text-white font-semibold">Discover</span>
          </div>
        </nav>
        {/* Spaces Grid */}
        <Suspense fallback={<LoadingSpaces />}>
          <PublicSpacesList />
        </Suspense>
        {/* Create Space CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-10 shadow-md inline-block">
            <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">
              Want to create your own public space?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Share your knowledge and build a community around your expertise
            </p>
            <a
              href="/spaces/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors font-semibold text-base"
            >
              Create New Space
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
