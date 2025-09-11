// app/actions/action.ts
"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "../auth";
import prisma from "@repo/db/client";

export async function handleSignOutAndRedirect(redirectPath: string) {
  await signOut();
  redirect(redirectPath);
}

export async function handleGoogleSignIn(redirectPath: string) {
  // If there's an invitation, we'll store it in the OAuth state
  if (redirectPath.includes("/invite/")) {
    const inviteToken = redirectPath.split("/invite/")[1];

    // Verify the invitation exists and get the email
    const invitation = await prisma.invitation.findUnique({
      where: {
        token: inviteToken,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    // Set up the callback URL for Google OAuth
    const acceptPath = `/invite/${inviteToken}/accept`;

    await signIn("google", {
      redirectTo: acceptPath,
      // Pass both invite token and expected email through OAuth state
      state: {
        inviteToken,
        expectedEmail: invitation.email,
      },
    });
  } else {
    await signIn("google", { redirectTo: redirectPath });
  }
}

export async function handleEmailSignIn(email: string, redirectPath: string) {
  // If there's an invitation, verify it before sending the email
  if (redirectPath.includes("/invite/")) {
    const inviteToken = redirectPath.split("/invite/")[1];
    const acceptPath = `/invite/${inviteToken}/accept`;

    // Verify the invitation exists
    const invitation = await prisma.invitation.findUnique({
      where: {
        token: inviteToken,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    // Verify email matches invitation
    if (invitation.email !== email) {
      throw new Error("This invitation is for a different email address");
    }

    await signIn("resend", {
      email,
      redirectTo: acceptPath,
    });
  } else {
    await signIn("resend", {
      email,
      redirectTo: redirectPath,
    });
  }
}

export async function acceptInvitation(token: string) {
  try {
    const response = await fetch(`/api/invitations/${token}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to accept invitation");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
