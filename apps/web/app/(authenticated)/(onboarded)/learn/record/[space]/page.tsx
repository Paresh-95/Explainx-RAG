

import { auth } from "../../../../../../auth";
import prisma from "@repo/db";
import LearnClient from "../../../../../../components/learn/learn-client";
import { notFound } from "next/navigation";

type Params = Promise<{
  space: string;
}>;

interface ContentPageProps {
  params: Params;
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { space } = await params;
  const session = await auth();

  try {
    // Fetch only the specific study material with essential relations
    const spaceData = await prisma.space.findUnique({
      where: {
        slug: space,
      },
      
    });

    if (!spaceData) {
      notFound();
    }

    const spaceId = spaceData.id;

    // Check if user has access to this study material through the space
    const hasAccess = 
      spaceData.visibility === 'PUBLIC' || 
      spaceData.ownerId === session?.user?.id ||
      (spaceData.organizationId && session?.user?.organizations?.some(
        (org: any) => org.organizationId === spaceData.organizationId
      ));

    if (!hasAccess) {
      notFound();
    }

    return (
      <div >
        <LearnClient 
          studyMaterial={null}
          space={space}
          session={session}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching study material:', error);
    notFound();
  }
}