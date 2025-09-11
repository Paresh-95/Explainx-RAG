import { NextResponse } from "next/server";
import { z } from "zod";
import { sendDiscordNotification } from "../../../lib/discord-notify";
import prisma from "@repo/db/client";
import { Prisma } from "@prisma/client";
// Helper function to validate phone numbers
function isValidPhoneNumber(phone: string): boolean {
  // Extract only digits from the phone number (very permissive)
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Need at least 7 digits for a valid phone number
  if (digitsOnly.length < 7) {
    return false;
  }
  
  // Check for obviously fake patterns
  const fakePatterns = [
    /^(\d)\1{6,}$/, // 7+ same digits (1111111, 22222222, etc.)
    /^0{7,}$/, // 7+ zeros
    /^1234567890?$/, // Sequential 1234567890
    /^0123456789?$/, // Sequential starting with 0
    /^9876543210?$/, // Reverse sequential
  ];
  
  // Check against fake patterns
  for (const pattern of fakePatterns) {
    if (pattern.test(digitsOnly)) {
      return false;
    }
  }
  
  return true;
}

const courseWaitlistSchema = z.object({
  email: z.string().email(),
  department: z.string().optional(),
  courseType: z.string().refine(val => 
    ["VIBE_CODING", "AI_FUNDAMENTALS", "PROMPT_ENGINEERING", "MACHINE_LEARNING", 
     "WEB_DEVELOPMENT", "DATA_SCIENCE", "BLOCKCHAIN", "MOBILE_DEVELOPMENT"].includes(val), {
    message: "Invalid course type"
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = courseWaitlistSchema.parse(body);

    // Create course waitlist entry with default values for required fields
    const entry = await prisma.courseWaitlistEntry.create({
      data: {
        email: validatedData.email,
        firstName: "Anonymous", // Default value
        lastName: "User", // Default value
        department: validatedData.department,
        courseType: validatedData.courseType as any, // Type assertion needed due to Prisma enum
        experience: "BEGINNER", // Default value
        status: "PENDING",
      },
    });

    // Create Discord notification
    const discordMessage = `🎯 **New Course Waitlist Entry**
    
📚 **Course:** ${validatedData.courseType.replace(/_/g, ' ')}
📧 **Email:** ${validatedData.email}
${validatedData.department ? `🏢 **Department:** ${validatedData.department}` : ''}

🆔 **Entry ID:** ${entry.id}
📅 **Registered At:** ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;

    // Send Discord notification
    sendDiscordNotification(
      discordMessage,
      false,
      process.env.DISCORD_WEBHOOK_COURSE_URL || process.env.DISCORD_WEBHOOK_URL
    ).catch(console.error);

    // Try to subscribe to newsletter if not already subscribed
    try {
      await prisma.newsletterSubscriber.create({
        data: {
          email: validatedData.email,
          subscriberType: 'COURSE_LEAD',
        },
      });
    } catch (error) {
      // Ignore unique constraint violation (already subscribed)
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
        console.error('Newsletter subscription error:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: entry.id,
        message: "Successfully joined the waitlist! We'll notify you when the course becomes available.",
      }
    });
  } catch (error) {
    console.error("Course waitlist error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid registration data", details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle unique constraint violation (already on waitlist)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: "You're already on the waitlist for this course" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to join waitlist", details: String(error) },
      { status: 500 }
    );
  }
} 