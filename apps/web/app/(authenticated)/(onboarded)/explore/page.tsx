// app/spaces/discover/page.tsx
import { Suspense } from "react";
import {
  Globe,
  Users,
  Calendar,
  Search,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";
import { redirect } from "next/navigation";
import SpaceMembershipButton from "../../../../components/space/SpaceMembershipButton";
import prisma from "@repo/db";
import { auth } from "../../../../auth";
import CreateSpaceCTA from "../../../../components/explore/create-space-cta";

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

  return spaces.map((space: any) => ({
    ...space,
    userMembership: (userId && space.memberships?.[0]) || null,
  }));
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
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 shadow-sm">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {space.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-700">
                    {space.owner.image ? (
                      <img
                        src={space.owner.image}
                        alt={space.owner.name || "Owner"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {space.owner.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {space.owner.name || space.owner.username || "Anonymous"}
                  </span>
                </div>
                {space.organization && (
                  <div className="flex items-center">
                    <span className="text-gray-400 dark:text-gray-500 text-xs">
                      •
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-1.5">
                      {space.organization.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {space.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
            {space.description}
          </p>
        )}

        {/* Tags */}
        {space.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {space.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
            {space.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
                +{space.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {space._count.memberships}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {space._count.studyMaterials} materials
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(space.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <a
            href={`/spaces/${space.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            Explore
            <ArrowRight className="h-4 w-4" />
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
    </div>
  );
}

function SearchSection() {
  return (
    <div className="relative mb-8">
      <div className="relative max-w-2xl mx-auto">
        <div className="relative bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search spaces by name, description, or tags..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpaces() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm animate-pulse border border-gray-200 dark:border-zinc-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-700 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded-lg mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-2/3" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-4/5" />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded-full w-16" />
            <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded-full w-20" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-9 bg-gray-200 dark:bg-zinc-700 rounded-lg w-20" />
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg w-16" />
          </div>
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
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mx-auto mb-6">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Public Spaces Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Be the first to create a public space that others can discover and
            join!
          </p>
          <a
            href="/spaces/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Create Public Space
          </a>
        </div>
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Discover Spaces
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explore public learning spaces created by the community. Join
            discussions, share knowledge, and grow together.
          </p>
        </div>

        {/* Navigation breadcrumbs */}
        <nav className="mb-8">
          <div className="flex items-center justify-center gap-2 text-sm">
            <a
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              My Spaces
            </a>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-gray-900 dark:text-white font-medium">
              Discover
            </span>
          </div>
        </nav>

        {/* Search */}
        <SearchSection />

        {/* Spaces Grid */}
        <Suspense fallback={<LoadingSpaces />}>
          <PublicSpacesList />
        </Suspense>

        {/* Create Space CTA */}
        <CreateSpaceCTA />
      </div>
    </div>
  );
}

