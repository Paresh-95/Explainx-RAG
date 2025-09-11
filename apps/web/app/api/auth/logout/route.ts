import { type NextRequest } from "next/server";
import { signOut } from "../../../../auth";

export async function POST(req: NextRequest) {
  try {
    await signOut();
    return new Response(JSON.stringify({ message: "Signed out successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Sign out error:", error);
    return new Response(JSON.stringify({ message: "Failed to sign out" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
} 