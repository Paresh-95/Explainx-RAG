// app/invite/[token]/page.tsx
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import {
  handleEmailSignIn,
  handleGoogleSignIn,
  handleSignOutAndRedirect,
} from "../../../actions/action";
import AuthForm from "../../../components/auth/AuthForm";
import prisma from "@repo/db/client";

type Params = Promise<{ token: string }>;

interface InvitePageProps {
  params: Params;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const session = await auth();
  const { token } = await params;

  // Check if invitation exists and is valid
  const invitation = await prisma.invitation.findUnique({
    where: {
      token,
      status: "PENDING",
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      organization: true,
    },
  });

  if (!invitation) {
    return redirect("/invalid-invite");
  }

  // Create server action for handling sign out
  const handleInvalidEmailSignOut = async () => {
    "use server";
    await handleSignOutAndRedirect(`/invite/${token}`);
  };

  // If user is authenticated but email doesn't match invitation
  if (session?.user && session.user.email !== invitation.email) {
    return (
      <form action={handleInvalidEmailSignOut}>
        <button type="submit" className="hidden">
          Sign Out
        </button>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.forms[0].submit()",
          }}
        />
      </form>
    );
  }

  // If user is authenticated and email matches invitation
  if (session?.user && session.user.email === invitation.email) {
    return redirect(`/invite/${token}/accept`);
  }

  // Create server actions for auth
  const handleEmailAuthWithToken = async (email: string) => {
    "use server";
    // Verify email matches invitation
    if (email !== invitation.email) {
      throw new Error("This invitation is for a different email address");
    }
    await handleEmailSignIn(email, `/invite/${token}`);
  };

  const handleGoogleAuthWithToken = async () => {
    "use server";
    await handleGoogleSignIn(`/invite/${token}`);
  };

  // If user needs to authenticate
  return (
    <AuthForm
      mode="signup"
      title="Accept Invitation"
      description={`Join ${invitation.organization.name} as a ${invitation.role.toLowerCase()}`}
      handleEmailAuth={handleEmailAuthWithToken}
      handleGoogleAuth={handleGoogleAuthWithToken}
      searchParams={{ invite: token }}
      defaultEmail={invitation.email}
      alternateAuthLink={{
        text: "Already have an account? Sign in",
        href: `/login?invite=${token}`,
      }}
    />
  );
}
