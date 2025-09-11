import { NextResponse } from "next/server";
import { z } from "zod";
import { sendDiscordNotification } from "../../../lib/discord-notify";
import prisma from "@repo/db/client";
import { Prisma } from "@prisma/client";

// Helper function to validate phone numbers and filter out fake ones
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

const workshopRegistrationSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional().refine(
    (phone) => {
      // If phone is empty or undefined, it's valid (since it's optional)
      if (!phone || phone.trim() === '') return true;
      
      return isValidPhoneNumber(phone);
    },
    {
      message: "Please provide a valid phone number"
    }
  ),
  department: z.string().optional(),
  experience: z.string().refine(val => 
    val === "BEGINNER" || val === "INTERMEDIATE" || val === "ADVANCED", {
    message: "Experience level must be BEGINNER, INTERMEDIATE, or ADVANCED"
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = workshopRegistrationSchema.parse(body);

    // Create workshop registration in database (step 1 - basic details only)
    const registration = await prisma.workshopRegistration.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        department: validatedData.department,
        experience: validatedData.experience,
        workshopType: "PROMPT_ENGINEERING",
        status: "REGISTERED",
      },
    });

    // Create basic Discord notification for step 1
    const discordMessage = `🎯 **Workshop Registration Started - Step 1 Complete**
    
👤 **Student Details:**
• Name: ${validatedData.firstName} ${validatedData.lastName}
• Email: ${validatedData.email}
• Phone: ${validatedData.phone || 'Not provided'}
• Department: ${validatedData.department || 'Not specified'}
• AI Experience Level: ${validatedData.experience}

🆔 **Registration ID:** ${registration.id}
📅 **Registered At:** ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

⏳ **Status:** Waiting for additional details (Step 2)`;

    // Send Discord notification using workshop-specific webhook
    sendDiscordNotification(
      discordMessage, 
      false, // statusUpdate
      process.env.DISCORD_WEBHOOK_WORKSHOP_URL // custom webhook for workshop registrations
    ).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      data: {
        id: registration.id,
        message: "Basic registration successful! Please complete additional details.",
      }
    });
  } catch (error) {
    console.error("Workshop registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid registration data", details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle unique constraint violation (duplicate email)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: "Email already registered for this workshop" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to register for workshop", details: String(error) },
      { status: 500 }
    );
  }
} 