// app/onboarding/page.tsx
"use server";
import { redirect } from "next/navigation";
import prisma from "@repo/db/client";
import { auth } from "../../../auth";
import OnboardingForm from "../../../components/onboarding/OnboardingForm";
import { toast } from "@repo/ui/hooks/use-toast";

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

  if (user?.organizations && user?.username) {

    if (user?.organizations.length > 0) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full">
        <OnboardingForm />
      </div>
    </main>
  );
}
