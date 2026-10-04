import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // Optionally identify the user
    const session = await auth();
    const userAlias = session?.user?.name || "Unknown Agent";
    const userEmail = session?.user?.email || "Unknown Email";

    const formData = await req.formData();
    const type = formData.get("type") as string;
    const message = formData.get("message") as string;
    const imageFile = formData.get("image") as File | null;

    if (!type || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("DISCORD_WEBHOOK_URL is not set in environment.");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Prepare Discord payload
    const discordPayload = new FormData();

    // Create the embed JSON
    const embedColor = type.includes("Bug") ? 15158332 : // Red
                       type.includes("Tool") ? 3447003 : // Blue
                       type.includes("Suggestions") ? 10181046 : // Purple
                       3066993; // Green

    const embed = {
      title: `HQ Transmission: ${type}`,
      description: message,
      color: embedColor,
      author: {
        name: `Agent: ${userAlias}`,
      },
      footer: {
        text: `Secure Uplink | ${userEmail}`,
      },
      timestamp: new Date().toISOString(),
    };

    if (imageFile) {
      // Append the actual file to FormData
      discordPayload.append("file", imageFile);
      // Link the uploaded file in the embed using the 'attachment://' protocol
      (embed as Record<string, unknown>).image = {
        url: `attachment://${imageFile.name}`,
      };
    }

    discordPayload.append("payload_json", JSON.stringify({ embeds: [embed] }));

    // Send to Discord
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: discordPayload,
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback transmission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
