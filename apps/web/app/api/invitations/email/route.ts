// app/api/invitations/email/route.ts
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { InvitationEmailTemplate } from "../../../../components/invitations/email-template";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function POST(req: Request) {
  try {
    const { email, inviteToken, organizationName, invitedByName } =
      await req.json();

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const { data, error } = await resend.emails.send({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: [email],
      subject: `Join ${organizationName} on ${process.env.NEXT_PUBLIC_APP_NAME}`,
      react: InvitationEmailTemplate({
        email,
        organizationName,
        inviteUrl,
        expiresAt,
        invitedByName,
      }),
    });

    if (error) {
      console.error("[EMAIL_SEND_ERROR]", error);
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data,
      message: "Invitation email sent successfully",
    });
  } catch (error) {
    console.error("[EMAIL_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
