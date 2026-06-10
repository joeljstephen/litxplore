import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { syncUserFromClerk } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request, {
      signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.CLERK_WEBHOOK_SECRET,
    });
    if (event.type !== "user.created" && event.type !== "user.updated") {
      return Response.json({ status: "ignored", event: event.type });
    }
    const user = event.data;
    const email = user.email_addresses[0]?.email_address || `${user.id}@litxplore.generated`;
    const record = await syncUserFromClerk(user.id, {
      email,
      first_name: user.first_name,
      last_name: user.last_name,
    });
    return Response.json({ status: "success", user_id: record.id });
  } catch (error) {
    return errorResponse(error);
  }
}
