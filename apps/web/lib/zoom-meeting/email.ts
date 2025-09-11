import { Resend } from "resend";
import {
  MeetingDetails,
  Member,
  SessionUser,
  Space,
  ZoomMeeting,
} from "../../types/meeting/zoom";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function sendMeetingInvitations({
  members,
  meetingDetails,
  space,
  sessionUser,
  zoomMeeting,
}: {
  members: Member[];
  meetingDetails: MeetingDetails;
  space: Space;
  sessionUser: SessionUser;
  zoomMeeting: ZoomMeeting;
}) {
  const { title, description, scheduledAt, duration } = meetingDetails;
  const emailPromises = members.map(async (member) => {
    if (!member.email) return;
    try {
      const data = await resend.emails.send({
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: [member.email],
        subject: `Meeting Scheduled: ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Meeting Scheduled</h2>
            <p>You're invited to join a meeting in the space: <strong>${space.name}</strong></p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">${title}</h3>
              ${description ? `<p style="margin: 5px 0;">${description}</p>` : ""}
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration || 60} minutes</p>
              <p style="margin: 5px 0;"><strong>Organizer:</strong> ${sessionUser.name || sessionUser.email}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${zoomMeeting.join_url}" 
                 style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Join Meeting
              </a>
            </div>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Meeting ID:</strong> ${zoomMeeting.id}<br>
                ${zoomMeeting.password ? `<strong>Password:</strong> ${zoomMeeting.password}<br>` : ""}
                <strong>Join URL:</strong> <a href="${zoomMeeting.join_url}">${zoomMeeting.join_url}</a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error(`Failed to send email to ${member.email}:`, emailError);
    }
  });
  await Promise.allSettled(emailPromises);
}
