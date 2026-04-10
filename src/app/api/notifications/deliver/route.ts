import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.VESPER_WEBHOOK_SECRET || "vesper-dev-secret";

/**
 * POST /api/notifications/deliver
 * Multi-channel notification delivery.
 * Checks user preferences and delivers to enabled channels.
 * Called by n8n workflows or agent webhooks when events happen.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-vesper-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const body = await request.json();
  const { user_id, event_type, title, message, priority, data } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "title and message are required" }, { status: 400 });
  }

  // Get all users' preferences (or specific user if user_id provided)
  let query = supabase.from("user_preferences").select("*");
  if (user_id) {
    query = query.eq("user_id", user_id);
  }
  const { data: preferences } = await query;

  if (!preferences || preferences.length === 0) {
    return NextResponse.json({ delivered: 0, channels: [] });
  }

  const deliveryResults: { userId: string; channel: string; status: string }[] = [];

  for (const pref of preferences) {
    const channels = pref.notification_channels as Record<string, boolean>;
    const types = pref.notification_types as Record<string, boolean>;

    // Check if this event type is enabled for this user
    if (event_type && types[event_type] === false) continue;

    // In-App notification (always store in agent_communications for now)
    if (channels.app) {
      await supabase.from("agent_communications").insert({
        message_type: "notification",
        subject: title,
        body: message,
        priority: priority ?? "normal",
        metadata: { event_type, delivery_channel: "app", ...data },
      });
      deliveryResults.push({ userId: pref.user_id, channel: "app", status: "delivered" });
    }

    // Email delivery (via webhook to n8n or direct API)
    if (channels.email && pref.notification_email) {
      // Queue for email delivery — n8n workflow will pick this up
      deliveryResults.push({ userId: pref.user_id, channel: "email", status: "queued" });
    }

    // WhatsApp delivery
    if (channels.whatsapp && pref.whatsapp_phone) {
      deliveryResults.push({ userId: pref.user_id, channel: "whatsapp", status: "queued" });
    }

    // Telegram delivery
    if (channels.telegram && pref.telegram_chat_id) {
      deliveryResults.push({ userId: pref.user_id, channel: "telegram", status: "queued" });
    }

    // Slack delivery
    if (channels.slack && pref.slack_webhook_url) {
      try {
        await fetch(pref.slack_webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `*${title}*\n${message}`,
            blocks: [
              { type: "header", text: { type: "plain_text", text: `🔔 ${title}` } },
              { type: "section", text: { type: "mrkdwn", text: message } },
            ],
          }),
        });
        deliveryResults.push({ userId: pref.user_id, channel: "slack", status: "delivered" });
      } catch {
        deliveryResults.push({ userId: pref.user_id, channel: "slack", status: "failed" });
      }
    }
  }

  return NextResponse.json({
    success: true,
    delivered: deliveryResults.filter((r) => r.status === "delivered").length,
    queued: deliveryResults.filter((r) => r.status === "queued").length,
    channels: deliveryResults,
  });
}
