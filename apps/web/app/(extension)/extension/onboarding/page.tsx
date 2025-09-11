// app/onboarding/page.tsx
"use server";
import { redirect } from "next/navigation";
import prisma from "@repo/db/client";
import { auth } from "../../../../auth";
import ExtensionOboarding from "../../../../components/onboarding/ExtensionOboarding";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if user has already completed onboarding
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organizations: true },
  });

  let alreadyOnboarded = false;
  if (user?.organizations && user?.username) {
    if (user?.organizations.length > 0) {
      alreadyOnboarded = true;
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full">
        <ExtensionOboarding alreadyOnboarded={alreadyOnboarded} />
      </div>
    </main>
  );
}
