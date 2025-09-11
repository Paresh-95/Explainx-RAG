import * as React from "react";

interface InvitationEmailTemplateProps {
  email: string;
  organizationName: string;
  inviteUrl: string;
  expiresAt: Date;
  invitedByName?: string;
}

export const InvitationEmailTemplate: React.FC<
  Readonly<InvitationEmailTemplateProps>
> = ({ email, organizationName, inviteUrl, expiresAt, invitedByName }) => {
  const expirationDate = new Date(expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: "40px 20px",
        background: "#f9fafb",
        color: "#111827",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "32px",
          maxWidth: "600px",
          margin: "0 auto",
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "24px",
            color: "#111827",
          }}
        >
          Join {organizationName} on Our Platform
        </h1>

        <p
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            color: "#374151",
            marginBottom: "24px",
          }}
        >
          {invitedByName ? `${invitedByName} has` : "You have"} invited you (
          {email}) to join {organizationName}.
        </p>

        <div
          style={{
            marginBottom: "32px",
          }}
        >
          <a
            href={inviteUrl}
            style={{
              display: "inline-block",
              background: "#2563eb",
              color: "white",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Accept Invitation
          </a>
        </div>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "16px",
          }}
        >
          Or copy and paste this URL into your browser:
          <br />
          <span style={{ color: "#2563eb" }}>{inviteUrl}</span>
        </p>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            marginTop: "32px",
            padding: "16px 0",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          This invitation will expire on {expirationDate}. If you did not expect
          this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>
  );
};
